# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def run(apps, schema_editor):
    Dashboard = apps.get_model("geosight_data", "Dashboard")
    ReferenceLayer = apps.get_model("geosight_georepo", "ReferenceLayer")

    for dashboard in Dashboard.objects.all():
        if dashboard.reference_layer_identifier:
            if dashboard.reference_layer_identifier:
                reference_layer, created = ReferenceLayer.objects.get_or_create(
                    identifier=dashboard.reference_layer_identifier
                )
                dashboard.reference_layer = reference_layer
                dashboard.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0017_dashboard_reference_layer')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
