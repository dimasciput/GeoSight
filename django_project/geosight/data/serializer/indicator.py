"""Indicator Serializer."""
from django.shortcuts import reverse
from rest_framework import serializers

from geosight.data.models.indicator import (
    Indicator, IndicatorRule, IndicatorValue
)


class IndicatorSerializer(serializers.ModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    rules = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return url."""
        return reverse(
            'indicator-values-api',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return group."""
        return obj.group.name if obj.group else ''

    def get_rules(self, obj: Indicator):
        """Return rules."""
        return IndicatorRuleSerializer(
            obj.indicatorrule_set.all(), many=True
        ).data

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'source', 'description', 'url',
            'reporting_level', 'rules', 'last_update')


class BasicIndicatorSerializer(serializers.ModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return url."""
        return reverse(
            'indicator-values-api',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return group."""
        return obj.group.name if obj.group else ''

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'source',
            'description', 'url', 'reporting_level')


class IndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    class Meta:  # noqa: D106
        model = IndicatorRule
        fields = '__all__'


class IndicatorValueSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    reference_layer = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    indicator = serializers.SerializerMethodField()

    def get_reference_layer(self, obj: IndicatorValue):
        """Return reference layer."""
        return obj.reference_layer.identifier

    def get_name(self, obj: IndicatorValue):
        """Return reference layer."""
        references_map = self.context.get('references_map', {})
        name = references_map[obj.reference_layer.identifier]
        return name if name else obj.reference_layer.identifier

    def get_indicator(self, obj: IndicatorValue):
        """Return indicator name."""
        return obj.indicator.__str__()

    class Meta:  # noqa: D106
        model = IndicatorValue
        fields = '__all__'


class IndicatorValueDetailSerializer(IndicatorValueSerializer):
    """Serializer for IndicatorValue."""

    details = serializers.SerializerMethodField()
    extra_data = serializers.SerializerMethodField()

    def get_details(self, obj: IndicatorValue):
        """Return extra data."""
        # for details
        details = []
        for row in obj.indicatorvalueextradetailrow_set.all():
            columns = {}
            for column in row.indicatorvalueextradetailcolumn_set.all():
                columns[column.name] = column.value
            details.append(columns)
        return details

    def get_extra_data(self, obj: IndicatorValue):
        """Return extra data."""
        # for details
        extras = {}
        for row in obj.indicatorextravalue_set.all():
            extras[row.name] = row.value
        return extras

    class Meta:  # noqa: D106
        model = IndicatorValue
        fields = '__all__'


class IndicatorValueBasicSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    class Meta:  # noqa: D106
        model = IndicatorValue
        exclude = ('indicator', 'geom_identifier')
