from __future__ import absolute_import, unicode_literals

from django.apps import AppConfig


class Config(AppConfig):
    """GeoSight Config App."""

    label = 'geosight_permission'
    name = 'geosight.permission'
    verbose_name = "GeoSight Permission"


default_app_config = 'geosight.permission.Config'
