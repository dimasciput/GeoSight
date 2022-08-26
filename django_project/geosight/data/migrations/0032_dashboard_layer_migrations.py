# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def run(apps, schema_editor):
    DashboardIndicator = apps.get_model("geosight_data", "DashboardIndicator")
    DashboardIndicatorLayer = apps.get_model(
        "geosight_data", "DashboardIndicatorLayer")
    DashboardIndicatorLayerIndicator = apps.get_model(
        "geosight_data", "DashboardIndicatorLayerIndicator"
    )

    for dashboardIndicator in DashboardIndicator.objects.all():
        layer = DashboardIndicatorLayer.objects.create(
            dashboard=dashboardIndicator.dashboard,
            order=dashboardIndicator.order,
            visible_by_default=dashboardIndicator.visible_by_default,
            group=dashboardIndicator.group,
        )
        DashboardIndicatorLayerIndicator.objects.create(
            object=layer,
            indicator=dashboardIndicator.object
        )

class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0031_auto_20220823_0943')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
