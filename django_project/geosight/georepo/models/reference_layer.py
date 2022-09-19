"""Reference Layer Model."""

from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.preferences import SitePreferences
from geosight.data.models.indicator import Indicator
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
        self.georepo_url = SitePreferences.preferences().georepo_url.strip('/')
        return f'{self.georepo_url}/api/reference-layer/{self.identifier}/'


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
