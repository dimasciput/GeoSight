# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import migrations

from geosight.data.models import (
    BasemapLayer, ContextLayer, Dashboard, Indicator
)
from geosight.harvester.models import Harvester
from geosight.permission.models import (
    BasemapLayerPermission, ContextLayerPermission, DashboardPermission,
    IndicatorPermission, HarvesterPermission, GroupModelPermission
)

User = get_user_model()


def run(apps, schema_editor):
    for resource in BasemapLayer.objects.all():
        BasemapLayerPermission.objects.get_or_create(obj=resource)
    for resource in ContextLayer.objects.all():
        ContextLayerPermission.objects.get_or_create(obj=resource)
    for resource in Dashboard.objects.all():
        DashboardPermission.objects.get_or_create(obj=resource)
    for resource in Group.objects.all():
        GroupModelPermission.objects.get_or_create(obj=resource)
    for resource in Harvester.objects.all():
        HarvesterPermission.objects.get_or_create(obj=resource)
    for resource in Indicator.objects.all():
        IndicatorPermission.objects.get_or_create(obj=resource)


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_permission', '0001_initial')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
