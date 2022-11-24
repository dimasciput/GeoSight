"""Indicator value models."""
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from geosight.data.models.indicator.indicator import Indicator, IndicatorType
from geosight.georepo.models import ReferenceLayer


class IndicatorValue(models.Model):
    """The data of indicator that saved per date and geometry."""

    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE
    )
    date = models.DateField(
        _('Date'),
        help_text=_('The date of the value harvested.')
    )
    value = models.FloatField(
        null=True, blank=True
    )
    value_str = models.CharField(
        max_length=256, null=True, blank=True
    )

    # -------------------------------------------------------
    # Grouping by geometries
    # By Reference Layer
    # By Level
    geom_identifier = models.CharField(
        max_length=256
    )
    reference_layer = models.ForeignKey(
        ReferenceLayer,
        help_text=_('Reference layer.'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    admin_level = models.IntegerField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        unique_together = ('indicator', 'date', 'geom_identifier')
        ordering = ('-date',)

    @property
    def val(self):
        """Return val of value based on int or string."""
        if self.indicator.type == IndicatorType.STRING:
            return self.value_str
        return self.value

    def permissions(self, user):
        """Return permission of user."""
        from geosight.permission.models.resource.dataset import (
            ReferenceLayerIndicatorPermission, ReferenceLayerIndicator
        )
        if user.profile.is_admin:
            return {
                'list': True, 'read': True, 'edit': True, 'share': True,
                'delete': True
            }
        if self.indicator.creator == user:
            return {
                'list': True, 'read': True, 'edit': True, 'share': True,
                'delete': True
            }
        try:
            obj = ReferenceLayerIndicator.objects.get(
                reference_layer=self.reference_layer,
                indicator=self.indicator,
            )
            permission = ReferenceLayerIndicatorPermission.objects.get(obj=obj)
            return permission.all_permission(user)
        except (
                ReferenceLayerIndicatorPermission.DoesNotExist,
                ReferenceLayerIndicator.DoesNotExist
        ):
            pass


class IndicatorExtraValue(models.Model):
    """Additional data for Indicator value data."""

    indicator_value = models.ForeignKey(
        IndicatorValue, on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=100,
        help_text=_(
            "The name of attribute"
        )
    )
    value = models.TextField(
        null=True, default=True,
        help_text=_(
            "The value of attribute"
        )
    )

    class Meta:  # noqa: D106
        unique_together = ('indicator_value', 'name')

    def __str__(self):
        return f'{self.name}'

    @property
    def key(self):
        """Return key of extra value in pythonic."""
        return self.name.replace(' ', '_').replace(':', '').lower()


class IndicatorValueExtraDetailRow(models.Model):
    """Additional data for Indicator value data."""

    indicator_value = models.ForeignKey(
        IndicatorValue, on_delete=models.CASCADE
    )


class IndicatorValueExtraDetailColumn(models.Model):
    """Additional data for Indicator value data."""

    row = models.ForeignKey(
        IndicatorValueExtraDetailRow, on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=100,
        help_text=_(
            "The name of column"
        )
    )
    value = models.TextField(
        null=True, default=True,
        help_text=_(
            "The value of cell"
        )
    )

    class Meta:  # noqa: D106
        unique_together = ('row', 'name')
