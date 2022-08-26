# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations


def run(apps, schema_editor):
    DashboardBookmark = apps.get_model("geosight_data", "DashboardBookmark")
    DashboardIndicatorLayerIndicator = apps.get_model(
        "geosight_data", "DashboardIndicatorLayerIndicator")

    for bookmark in DashboardBookmark.objects.all():
        dashboard = bookmark.dashboard
        selected_indicators = bookmark.selected_indicators.all()
        for selected_indicator in selected_indicators:
            layers = dashboard.dashboardindicatorlayer_set.all()
            for layer in layers:
                layer_indicators = layer.dashboardindicatorlayerindicator_set
                try:
                    selected_layer = layer_indicators.all().get(
                        indicator__id=selected_indicator.id
                    )
                    bookmark.selected_indicator_layer = selected_layer.object
                    bookmark.save()
                except DashboardIndicatorLayerIndicator.DoesNotExist:
                    pass


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0033_dashboardbookmark_selected_indicator_layer')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
