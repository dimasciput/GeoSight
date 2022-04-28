# Generated by Django 3.2.8 on 2022-01-26 07:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gap_data', '0021_auto_20220125_1043'),
    ]

    operations = [
        migrations.AlterField(
            model_name='indicator',
            name='dashboard_link',
            field=models.CharField(blank=True, help_text='A dashboard link can be any URL to e.g. a BI platform or another web site. This is optional, and when populated, a special icon will be shown next to the indicator which, when clicked, will open up this URL in a frame over the main map area.', max_length=1024, null=True),
        ),
        migrations.AlterField(
            model_name='indicator',
            name='shortcode',
            field=models.CharField(blank=True, help_text='A computer-to-computer shortcode for this indicator. For example, an abbreviated name that you might use to refer to it in a spreadsheet column.', max_length=512, null=True),
        ),
        migrations.AlterField(
            model_name='indicator',
            name='unit',
            field=models.CharField(blank=True, help_text="A unit e.g. 'cases', 'people', 'children', that will be shown alongside the number in reports.", max_length=64, null=True),
        ),
    ]