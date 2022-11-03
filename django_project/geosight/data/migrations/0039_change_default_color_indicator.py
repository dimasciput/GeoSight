# -*- coding: utf-8 -*-
"""Update all values, this will be deprecated."""

from __future__ import unicode_literals

from django.db import migrations

from core.models.preferences import SitePreferences
from geosight.data.models.dashboard import DashboardIndicatorRule
from geosight.data.models.indicator import IndicatorRule


def run(apps, schema_editor):
    preferences = SitePreferences.load()
    DashboardIndicatorRule.objects.filter(rule='No data').update(
        color=preferences.indicator_no_data_fill_color,
        outline_color=preferences.indicator_no_data_outline_color
    )
    DashboardIndicatorRule.objects.filter(rule='Other data').update(
        color=preferences.indicator_other_data_fill_color,
        outline_color=preferences.indicator_other_data_outline_color
    )
    IndicatorRule.objects.filter(rule='No data').update(
        color=preferences.indicator_no_data_fill_color,
        outline_color=preferences.indicator_no_data_outline_color
    )
    IndicatorRule.objects.filter(rule='Other data').update(
        color=preferences.indicator_other_data_fill_color,
        outline_color=preferences.indicator_other_data_outline_color
    )


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0038_auto_20221014_0632'),
        ('core', '0008_auto_20221103_0407')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
