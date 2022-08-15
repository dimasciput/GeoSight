"""Dashboard model."""
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractTerm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard.dashboard import Dashboard
from geosight.data.models.indicator import Indicator

User = get_user_model()


class DashboardBookmark(AbstractTerm):
    """Bookmark model for dashboard."""

    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE
    )
    creator = models.ForeignKey(
        User,
        null=True, blank=True,
        help_text=_('User who create the bookmark.'),
        on_delete=models.SET_NULL
    )
    extent = models.PolygonField(
        blank=True, null=True,
        help_text=_('Extent of the dashboard. If empty, it is the whole map')
    )
    filters = models.TextField(
        blank=True, null=True
    )
    selected_basemap = models.ForeignKey(
        BasemapLayer,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    selected_indicators = models.ManyToManyField(
        Indicator, blank=True
    )
    selected_context_layers = models.ManyToManyField(
        ContextLayer, blank=True
    )

    class Meta:  # noqa: D106
        unique_together = ('dashboard', 'name')
        ordering = ('name',)

    def save_relations(self, data):
        """Save all relationship data."""
        from geosight.data.models import Indicator, ContextLayer
        try:
            for row in data['selectedIndicators']:
                self.selected_indicators.add(
                    Indicator.objects.get(id=row)
                )
        except Indicator.DoesNotExist:
            raise Exception('Indicator does not exist')

        try:
            for row in data['selectedContextLayers']:
                self.selected_context_layers.add(
                    ContextLayer.objects.get(id=row)
                )
        except ContextLayer.DoesNotExist:
            raise Exception('Context layer does not exist')
