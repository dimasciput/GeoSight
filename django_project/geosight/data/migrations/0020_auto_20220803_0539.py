# Generated by Django 3.2.13 on 2022-08-03 05:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_georepo', '0001_initial'),
        ('geosight_data', '0019_remove_dashboard_reference_layer_identifier'),
    ]

    operations = [
        migrations.AddField(
            model_name='indicatorvalue',
            name='admin_level',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='indicatorvalue',
            name='reference_layer',
            field=models.ForeignKey(blank=True, help_text='Reference layer.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_georepo.referencelayer'),
        ),
    ]
