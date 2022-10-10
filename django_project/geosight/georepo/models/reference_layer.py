"""Reference Layer Model."""

from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from geosight.data.models.indicator import Indicator
from geosight.georepo.request import GeorepoRequest
from geosight.georepo.request import GeorepoUrl
from geosight.permission.models.manager import PermissionManager


class ReferenceLayer(models.Model):
    """Reference Layer data."""

    identifier = models.CharField(
        max_length=256,
        help_text=_("Reference layer identifier."),
        unique=True
    )

    name = models.CharField(
        max_length=256,
        help_text=_("Reference layer name."),
        null=True, blank=True
    )

    def __str__(self):
        """Return str."""
        return self.identifier

    @property
    def detail_url(self):
        """Return API link for reference detail."""
        url = GeorepoUrl()
        return url.reference_layer_detail.replace(
            '<identifier>', self.identifier
        )

    def geojson(self, admin_level: int, codes: list = None):
        """Return geojson by admin level."""
        return GeorepoRequest().get_reference_layer_geojson(
            self.identifier,
            admin_level,
            codes=codes
        )


class ReferenceLayerIndicator(models.Model):
    """Reference Layer x Indicator data."""

    reference_layer = models.ForeignKey(
        ReferenceLayer, on_delete=models.CASCADE
    )
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE
    )

    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        unique_together = ('reference_layer', 'indicator')

    @property
    def creator(self):
        """Return creator from the indicator."""
        return self.indicator.creator

    @property
    def created_at(self):
        """Return created time from the indicator."""
        return self.indicator.created_at

    @property
    def modified_at(self):
        """Return modified time from the indicator."""
        return self.indicator.modified_at
