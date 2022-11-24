# -*- coding: utf-8 -*-
"""Update all values, this will be deprecated."""

from __future__ import unicode_literals

import requests
from django.db import migrations

from geosight.georepo.request import GeorepoUrl


def run(apps, schema_editor):
    # TODO:
    #  Move this to management command
    #  To prevent calling georepo on migrations
    return

    Indicator = apps.get_model("geosight_data", "Indicator")
    ReferenceLayer = apps.get_model("geosight_georepo", "ReferenceLayer")

    reference_layers = {}
    level_by_name = {}
    georepo = GeorepoUrl()
    req = requests.get(georepo.reference_layer_list)
    for data in req.json():
        ref, created = ReferenceLayer.objects.get_or_create(
            identifier=data['identifier'])
        reference_layers[data['name']] = ref

        detail = requests.get(
            georepo.reference_layer_detail.replace(
                '<identifier>', data['identifier']
            )
        )
        for level in detail.json()['levels']:
            level_by_name[level['level_name']] = {
                'level': level['level'],
                'identifier': ref
            }

    for indicator in Indicator.objects.all():
        level = None
        reference_layer = None
        try:
            level_data = level_by_name[indicator.reporting_level]
            level = level_data['level']
            reference_layer = level_data['identifier']
        except KeyError:
            try:
                level = int(indicator.reporting_level)
            except ValueError:
                pass

        if indicator.group.name == 'Ukraine':
            reference_layer = reference_layers['Ukraine']

        indicator.indicatorvalue_set.update(
            reference_layer=reference_layer,
            admin_level=level
        )


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0020_auto_20220803_0539')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
