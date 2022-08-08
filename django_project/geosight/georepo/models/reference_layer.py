"""Harvester Model."""

from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.preferences import SitePreferences


class ReferenceLayer(models.Model):
    """Reference Layer data."""

    identifier = models.CharField(
        max_length=256,
        help_text=_("Reference layer identifier."),
        unique=True
    )

    def __str__(self):
        """Return str."""
        return self.identifier

    @property
    def detail_url(self):
        """Return API link for reference detail."""
        self.georepo_url = SitePreferences.preferences().georepo_url.strip('/')
        return f'{self.georepo_url}/api/reference-layer/{self.identifier}/'
