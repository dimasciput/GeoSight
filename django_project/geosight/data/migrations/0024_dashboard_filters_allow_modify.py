# Generated by Django 3.2.13 on 2022-08-11 04:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0023_auto_20220809_0742'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboard',
            name='filters_allow_modify',
            field=models.BooleanField(default=False),
        ),
    ]
