"""Dashboard Relation models."""
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models

from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import (
    ContextLayer,
    ContextLayerFieldAbstract
)
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.indicator import Indicator, IndicatorValue
from geosight.data.models.rule import RuleModel
from core.models.general import AbstractTerm

User = get_user_model()


class DashboardRelationGroup(AbstractTerm):
    """Group for dashboard relation data"""
    group = models.ForeignKey(
        'geosight_data.DashboardRelationGroup',
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )
    def __str__(self):
        return self.name


class DashboardRelation(models.Model):
    """Abstract Dashboard Relation.

    This has:
    - dashboard
    - order
    - visible_by_default
    """

    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )
    visible_by_default = models.BooleanField(
        default=False
    )
    group = models.CharField(
        max_length=512,
        blank=True, null=True
    )
    relation_group = models.ForeignKey(
        'geosight_data.DashboardRelationGroup',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    class Meta:  # noqa: D106
        abstract = True


class DashboardIndicator(DashboardRelation):
    """Indicator x Dashboard model."""

    object = models.ForeignKey(
        Indicator,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        ordering = ('object__name',)


class DashboardIndicatorRule(RuleModel):
    """Indicator x Dashboard rule."""

    object = models.ForeignKey(
        DashboardIndicator,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
        ordering = ('order',)


# DASHBOARD INDICATOR LAYER
class DashboardIndicatorLayer(DashboardRelation):
    """Indicator Layer x Dashboard model."""

    name = models.CharField(
        max_length=512,
        blank=True, null=True
    )
    description = models.TextField(
        blank=True, null=True
    )
    style = models.TextField(
        blank=True, null=True,
        help_text=(
            "This is specifically used for multi indicators layer."
            "For single layer, it will use rule of indicator"
        )
    )

    @property
    def label(self):
        """Return label data."""
        indicators = self.dashboardindicatorlayerindicator_set

        # If it is multi indicator
        if indicators.count() >= 2:
            return self.name if self.name else ''

        layer_indicator = self.dashboardindicatorlayerindicator_set.first()
        indicator = layer_indicator.indicator if layer_indicator else None
        return indicator.name if indicator else ""

    @property
    def desc(self):
        """Return description data."""
        indicators = self.dashboardindicatorlayerindicator_set

        # If it is multi indicator
        if indicators.count() >= 2:
            return self.description if self.description else ''

        layer_indicator = self.dashboardindicatorlayerindicator_set.first()
        indicator = layer_indicator.indicator if layer_indicator else None
        return indicator.description if indicator else ""

    @property
    def last_update(self):
        """Return description data."""
        indicator_ids = self.dashboardindicatorlayerindicator_set.values_list(
            'indicator__id', flat=True)

        first_value = IndicatorValue.objects.filter(
            indicator_id__in=indicator_ids).first()
        if first_value:
            return first_value.date
        return None

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardIndicatorLayerIndicator(models.Model):
    """Indicator Layer x Dashboard model."""

    object = models.ForeignKey(
        DashboardIndicatorLayer,
        on_delete=models.CASCADE
    )
    indicator = models.ForeignKey(
        Indicator,
        on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )
    name = models.CharField(
        max_length=512,
        blank=True, null=True
    )
    color = models.CharField(
        max_length=16,
        default='#000000',
        blank=True, null=True
    )

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardBasemap(DashboardRelation):
    """Indicator x Basemap model."""

    object = models.ForeignKey(
        BasemapLayer,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardContextLayer(DashboardRelation):
    """Indicator x ContextLayer model."""

    object = models.ForeignKey(
        ContextLayer,
        on_delete=models.CASCADE
    )
    styles = models.TextField(
        null=True, blank=True
    )
    label_styles = models.TextField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        ordering = ('order',)


class DashboardContextLayerField(ContextLayerFieldAbstract):
    """Indicator x Dashboard rule."""

    object = models.ForeignKey(
        DashboardContextLayer,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('object', 'name')
