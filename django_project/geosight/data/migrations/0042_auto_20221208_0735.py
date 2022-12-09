# Generated by Django 3.2.13 on 2022-12-08 07:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0041_alter_codelist_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='DashboardRelationGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('order', models.IntegerField(default=0)),
                ('group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboardrelationgroup')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='dashboardbasemap',
            name='relation_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup'),
        ),
        migrations.AddField(
            model_name='dashboardcontextlayer',
            name='relation_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup'),
        ),
        migrations.AddField(
            model_name='dashboardindicator',
            name='relation_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup'),
        ),
        migrations.AddField(
            model_name='dashboardindicatorlayer',
            name='relation_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup'),
        ),
        migrations.AddField(
            model_name='widget',
            name='relation_group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup'),
        ),
    ]
