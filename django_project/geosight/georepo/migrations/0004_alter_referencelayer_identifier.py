# Generated by Django 3.2.13 on 2022-11-10 02:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_georepo', '0003_referencelayer_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='referencelayer',
            name='identifier',
            field=models.CharField(help_text='Reference layer identifier.', max_length=256),
        ),
    ]