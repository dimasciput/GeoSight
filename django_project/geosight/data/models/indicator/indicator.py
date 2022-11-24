"""Indicator model."""
from datetime import date

from django.contrib.gis.db import models
from django.shortcuts import reverse

from core.models.general import AbstractTerm, AbstractSource, AbstractEditData
from geosight.data.models.code import CodeList
from geosight.permission.models.manager import PermissionManager


# INDICATOR TYPE
class IndicatorType(object):
    """Indicator type for the indicator based on value."""

    INTEGER = 'Integer'
    FLOAT = 'Float'
    STRING = 'String'


IndicatorTypeChoices = (
    (IndicatorType.INTEGER, IndicatorType.INTEGER),
    (IndicatorType.FLOAT, IndicatorType.FLOAT),
    (IndicatorType.STRING, 'Category'),
)


# AGGREGATION METHOD
class AggregationMethod(object):
    """A quick couple variable for AggregationMethod."""

    SUM = 'Aggregate data by sum all data.'
    AVERAGE = 'Aggregate data by average data in the levels.'
    MAJORITY = 'Aggregate data by majority data in the levels.'


class IndicatorValueRejectedError(Exception):
    """Exceptions for value rejected."""

    pass


class IndicatorGroup(AbstractTerm):
    """The group of indicator."""

    class Meta:  # noqa: D106
        ordering = ('name',)


class Indicator(AbstractTerm, AbstractSource, AbstractEditData):
    """The indicator model."""

    shortcode_helptext = (
        'A computer-to-computer shortcode for this indicator. '
        'For example, an abbreviated '
        'name that you might use to refer to it in a spreadsheet column.'
    )

    shortcode = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=shortcode_helptext
    )
    group = models.ForeignKey(
        IndicatorGroup, on_delete=models.SET_NULL,
        blank=True, null=True
    )
    unit = models.CharField(
        max_length=64,
        null=True, blank=True,
        help_text=(
            "A unit e.g. 'cases', 'people', 'children', "
            "that will be shown alongside the number in reports."
        )
    )

    aggregation_method = models.CharField(
        max_length=256,
        default=AggregationMethod.AVERAGE,
        choices=(
            (AggregationMethod.AVERAGE,
             'Aggregate data by average data in the levels'),
            (AggregationMethod.MAJORITY,
             'Aggregate data by majority data in the levels'),
            (AggregationMethod.SUM,
             'Aggregate data by sum of all data in the levels'),
        )
    )

    # Value control
    type = models.CharField(
        max_length=256,
        default=IndicatorType.FLOAT,
        choices=IndicatorTypeChoices
    )
    min_value = models.FloatField(
        null=True, blank=True
    )
    max_value = models.FloatField(
        null=True, blank=True
    )
    codelist = models.ForeignKey(
        CodeList, null=True, blank=True,
        on_delete=models.SET_NULL
    )

    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        ordering = ('group__name', 'name')

    def __str__(self):
        return f'{self.group}/{self.name}'

    # TODO:
    #  Remove this after we have aggregation
    @property
    def reporting_level(self):
        """Return reporting level."""
        first_value = self.query_values().first()
        if self.query_values().first():
            return first_value.admin_level
        return 0

    @property
    def reporting_levels(self):
        """Return reporting level."""
        levels = list(
            set(
                self.query_values().values_list('admin_level', flat=True)
            )
        )
        if levels:
            return levels
        return []

    @property
    def last_update(self):
        """Return reporting level."""
        first_value = self.query_values().first()
        if first_value:
            return first_value.date
        return None

    @property
    def create_harvester_url(self):
        """Create the first harvester url for this indicator."""
        from geosight.harvester.models.harvester import HARVESTERS
        return reverse(HARVESTERS[0][0], args=[self.id])

    def rules_dict(self):
        """Return rules in list of dict."""
        from geosight.data.serializer.indicator import IndicatorRuleSerializer
        return [
            dict(rule) for rule in IndicatorRuleSerializer(
                self.indicatorrule_set.all(), many=True
            ).data
        ]

    def save_value(
            self,
            date: date, geom_identifier: str, value: any,
            reference_layer=None, admin_level: int = None, extras: dict = None
    ):
        """Save new value for the indicator."""
        from geosight.data.models.indicator import (
            IndicatorValue, IndicatorExtraValue
        )
        from geosight.georepo.models import ReferenceLayer

        # Validate data
        if self.type == IndicatorType.INTEGER:
            try:
                if isinstance(value, str):
                    value = int(value)
                elif not isinstance(value, int):
                    raise ValueError

                if self.min_value is not None:
                    if value < self.min_value:
                        raise IndicatorValueRejectedError(
                            f'Value is less than {self.min_value}'
                        )
                if self.max_value is not None:
                    if value > self.max_value:
                        raise IndicatorValueRejectedError(
                            f'Value is more than {self.max_value}'
                        )
            except ValueError:
                raise IndicatorValueRejectedError('Value is not integer')
        elif self.type == IndicatorType.FLOAT:
            try:
                value = float(value)
                if self.min_value is not None:
                    if value < self.min_value:
                        raise IndicatorValueRejectedError(
                            f'Value is less than {self.min_value}'
                        )
                if self.max_value is not None:
                    if value > self.max_value:
                        raise IndicatorValueRejectedError(
                            f'Value is more than {self.max_value}')
            except ValueError:
                raise IndicatorValueRejectedError('Value is not float')
        elif self.type == IndicatorType.STRING:
            if isinstance(value, str):
                if self.codelist:
                    codes = self.codelist.codes
                    if codes and value not in codes:
                        raise IndicatorValueRejectedError(
                            f'Value is not in {codes}'
                        )
            else:
                raise IndicatorValueRejectedError('Value is not string')

        # Save data
        if reference_layer and isinstance(reference_layer, str):
            reference_layer, created = ReferenceLayer.objects.get_or_create(
                identifier=reference_layer
            )
        indicator_value, created = IndicatorValue.objects.get_or_create(
            indicator=self,
            date=date,
            geom_identifier=geom_identifier,
            defaults={
                'reference_layer': reference_layer,
                'admin_level': admin_level
            }
        )
        if self.type == IndicatorType.STRING:
            indicator_value.value_str = value
        else:
            indicator_value.value = value
        indicator_value.save()

        if extras:
            for extra_key, extra_value in extras.items():
                indicator_extra_value, created = \
                    IndicatorExtraValue.objects.get_or_create(
                        indicator_value=indicator_value,
                        name=extra_key
                    )
                indicator_extra_value.value = extra_value
                indicator_extra_value.save()
        return indicator_value

    def query_values(
            self, date_data: date = None, min_date_data: date = None,
            reference_layer=None, admin_level: int = None
    ):
        """Return query of indicator values."""
        query = self.indicatorvalue_set.all()
        if reference_layer:
            query = query.filter(reference_layer=reference_layer)
        if admin_level:
            query = query.filter(admin_level=admin_level)
        if date_data:
            query = query.filter(date__lte=date_data)
        if min_date_data:
            query = query.filter(date__gte=min_date_data)
        return query

    def rule_by_value(self, value, rule_set=None):
        """Return scenario level of the value."""
        if not rule_set:
            rule_set = self.indicatorrule_set.all()
        if value is not None:
            # check the rule
            for indicator_rule in rule_set:
                try:
                    if indicator_rule.rule and eval(
                            indicator_rule.rule.replace(
                                'x', f'{value}').lower()
                    ):
                        return indicator_rule
                except (NameError, SyntaxError):
                    pass
            # This is empty one, use the other data
            return rule_set.filter(
                active=True
            ).filter(
                rule__icontains='other data'
            ).first()
        return None

    def serialize(self, geometry_code, value, attributes=None, date=None):
        """Return data."""
        values = {
            'geometry_code': geometry_code,
            'value': value,
            'date': date.strftime("%d-%m-%Y")
        }
        if attributes:
            values.update(attributes)
        return values

    def values(
            self, date_data: date, min_date_data: date = None,
            reference_layer=None, admin_level: int = None):
        """Return list data based on date.

        If it is upper than the reporting geometry level,
        it will be aggregate to upper level
        """
        values = []
        query = self.query_values(
            date_data=date_data, min_date_data=min_date_data,
            reference_layer=reference_layer, admin_level=admin_level)
        query_report = query.order_by(
            'geom_identifier', '-date').distinct(
            'geom_identifier')
        for indicator_value in query_report:
            attributes = {}
            if indicator_value.indicatorextravalue_set.count():
                attributes.update({
                    extra.key: extra.value for extra in
                    indicator_value.indicatorextravalue_set.all()
                })
            value = self.serialize(
                geometry_code=indicator_value.geom_identifier,
                value=indicator_value.val,
                attributes=attributes,
                date=indicator_value.date,
            )
            values.append(value)
        return values
