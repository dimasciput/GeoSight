# Generated by Django 3.2.13 on 2022-12-08 05:58
from __future__ import unicode_literals

from django.db import migrations


def run(apps, schema_editor):
    DashboardIndicator = apps.get_model("geosight_data", "DashboardIndicator")
    DashboardIndicatorGroup = apps.get_model("geosight_data", "DashboardIndicatorGroup")
    DashboardBasemap = apps.get_model("geosight_data", "DashboardBasemap")
    DashboardContextLayer = apps.get_model("geosight_data", "DashboardContextLayer")
    DashboardIndicatorLayer = apps.get_model("geosight_data", "DashboardIndicatorLayer")
    Widget = apps.get_model("geosight_data", "Widget")
    indicators = DashboardIndicator.objects.exclude(
        group=''
    )
    basemaps = DashboardBasemap.objects.exclude(
        group=''
    )
    dashboard_indicators = DashboardIndicatorLayer.objects.exclude(
        group=''
    )
    context_layers = DashboardContextLayer.objects.exclude(
        group=''
    )
    widgets = Widget.objects.exclude(
        group=''
    )
    for indicator in indicators:
        group, _ = DashboardIndicatorGroup.objects.get_or_create(
            name=indicator.group
        )
        indicator.indicator_group = group
        indicator.save()
    for basemap in basemaps:
        group, _ = DashboardIndicatorGroup.objects.get_or_create(
            name=basemap.group
        )
        basemap.indicator_group = group
        basemap.save()
    for context_layer in context_layers:
        group, _ = DashboardIndicatorGroup.objects.get_or_create(
            name=context_layer.group
        )
        context_layer.indicator_group = group
        context_layer.save()
    for widget in widgets:
        group, _ = DashboardIndicatorGroup.objects.get_or_create(
            name=widget.group
        )
        widget.indicator_group = group
        widget.save()
    for dashboard_indicator in dashboard_indicators:
        group, _ = DashboardIndicatorGroup.objects.get_or_create(
            name=dashboard_indicator.group
        )
        dashboard_indicator.indicator_group = group
        dashboard_indicator.save()


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0042_auto_20221208_0557'),
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
