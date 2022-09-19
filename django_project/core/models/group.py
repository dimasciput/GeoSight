"""Proxy model for group."""

from django.contrib.auth.models import Group
from django.db import models

from geosight.permission.models.manager import PermissionManager


class GeosightGroup(Group):
    """Proxy model for group."""

    class Meta:  # noqa: D106
        proxy = True

    objects = models.Manager()
    permissions = PermissionManager()

    @property
    def creator(self):
        """Return creator of permission."""
        return self.permission.creator
