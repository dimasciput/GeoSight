"""Sharepoint Harvester."""
import json
from datetime import datetime

from django.conf import settings
from django.db import transaction

from geosight.data.models import (
    Indicator, IndicatorValue, IndicatorExtraValue
)
from geosight.harvester.harveters._base import BaseHarvester, HarvestingError
from geosight.harvester.sharepoint import Sharepoint


class RecordError(Exception):
    """Error for Record evaluation."""

    def __init__(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class SharepointHarvester(BaseHarvester):
    """Harvester using sharepoint file in the volume settings.ONEDRIVE_ROOT."""

    description = (
        "Harvester using sharepoint file. <br>"
        "It will fetch the data from sharepoint."
    )

    @staticmethod
    def additional_attributes(**kwargs) -> dict:
        """Return additional attributes."""
        attr = {
            'file': {
                'title': "Relative path of file",
                'description': (
                    f"Relative path of file in {settings.SHAREPOINT_URL}."
                )
            },
            'sheet_name': {
                'title': "Sheet name",
                'description': (
                    "Sheetname that will be used. "
                    "If empty, it will use first sheet"
                ),
                'required': False
            },
            'column_name_indicator_code': {
                'title': "Column Name: Indicator Code",
                'description': (
                    "The name of column in the first row in "
                    "the file contains indicator code. "
                ),
                'value': "IndicatorCode"
            },
            'column_name_administration_code': {
                'title': "Column Name: Administration Code",
                'description': (
                    "The name of column in the first row in "
                    "the file contains administration code. "
                ),
                'value': "GeographyCode"
            },
            'column_name_date_time': {
                'title': "Column Name: Date Time",
                'description': (
                    "The name of column  in the first row in "
                    "file contains date and time of data"
                ),
                'value': "DateTime"
            },
            'column_name_value': {
                'title': "Column Name: Value",
                'description': (
                    "The name of column in the first row in "
                    "the file contains data"
                ),
                'value': "Value"
            },
        }
        return attr

    def _process(self):
        """Run the harvester."""
        harvester = self.harvester
        reference_layer = harvester.reference_layer
        admin_level = harvester.admin_level

        # format data
        self._update('Fetching data')

        # get data from file
        sheet = Sharepoint().load_excelfile(self.attributes['file'])

        # check the sheet
        if sheet:
            try:
                sheet_name = self.attributes.get('sheet_name')
                records = sheet[
                    sheet_name if sheet_name else list(sheet.keys())[0]
                ]
                headers = records[0]
            except KeyError:
                raise HarvestingError(
                    f'Sheet name : '
                    f'{self.attributes.get("sheet_name", "")} does not exist.'
                )

            # get index of each columns
            try:
                idx_indicator_code = headers.index(
                    self.attributes['column_name_indicator_code']
                )
                idx_administration_code = headers.index(
                    self.attributes['column_name_administration_code']
                )
                idx_date_time = headers.index(
                    self.attributes['column_name_date_time']
                )
                idx_value = headers.index(
                    self.attributes['column_name_value']
                )
            except ValueError as e:
                raise HarvestingError(f'{e}'.replace('list', 'header'))

            # check index of extra data
            extra_data = {}
            if 'extra_columns' in self.attributes and self.attributes[
                'extra_columns'
            ]:
                for extra in self.attributes['extra_columns'].split(','):
                    extra_data[extra] = headers.index(extra)

            # Save the data in atomic
            # When 1 is error, we need to raise exeptions
            success = True
            details = []
            error_separator = ':error:'
            with transaction.atomic():
                details.append(headers)

                # check per line
                total = len(records[1:])
                for record_idx, record in enumerate(records[1:]):
                    self._update(
                        f'Processing line '
                        f'{record_idx}/{total}'
                    )
                    detail = [str(r) for r in record]

                    # -------------------------------------------------------
                    # Validation
                    # ------------------------------------------------------
                    date_time = None
                    administration_code = record[idx_administration_code]

                    # check the value
                    try:
                        value = record[idx_value]
                    except IndexError:
                        continue

                    # check indicator
                    indicators = Indicator.objects.filter(
                        shortcode=record[idx_indicator_code]
                    )
                    if indicators.count() > 1:
                        detail[idx_indicator_code] += (
                            "This shortcode is being used by "
                            "more than 1 indicator."
                        )
                    elif indicators.count() == 0:
                        detail[idx_indicator_code] += (
                            "This indicator does not exist."
                        )
                    else:
                        indicator = indicators[0]

                    if indicator:
                        rules_query = indicator.indicatorrule_set.exclude(
                            name__iexact='no data'
                        ).exclude(
                            name__iexact='other data'
                        )
                        rule_names = [name.lower() for name in list(
                            rules_query.values_list(
                                'name', flat=True)
                        )]
                        rules = list(
                            rules_query.values_list(
                                'rule', flat=True)
                        )

                        try:
                            # convert to percent
                            value = float(value)

                            # this is specifically for %
                            if indicator.unit == '%':
                                value = value * 100
                                detail[idx_value] = f'{value}%'
                        except ValueError:
                            try:
                                rule_index = rule_names.index(value.lower())
                            except ValueError:
                                if len(rule_names):
                                    detail[idx_value] += (
                                        f'{error_separator}'
                                        f'Value is not in {rule_names}'
                                    )
                                else:
                                    detail[idx_value] += (
                                        f'{error_separator}'
                                        f'Value is not recognized.'
                                    )
                            else:
                                try:
                                    value = float(
                                        rules[rule_index].replace(
                                            ' ', '').replace('x==', '')
                                    )
                                except ValueError:
                                    detail[idx_value] += (
                                        f"{error_separator}Can't apply "
                                        f"{value} to any rule"
                                    )

                    # Check year in integer
                    if not record[idx_date_time]:
                        detail[
                            idx_date_time] += error_separator + 'Date is empty'
                    else:
                        try:
                            date_time = datetime.strptime(
                                '2022/08/31', '%Y/%m/%d')
                        except ValueError:
                            try:
                                date_time = datetime.strptime(
                                    '2022/08/31', '%Y-%m-%d')
                            except ValueError:
                                detail[idx_date_time] += (
                                    'Date format should be '
                                    'YYYY/MM/DD or YYYY-MM-DD'
                                )

                    if administration_code and date_time and type(
                            value) == float:
                        indicator_value, created = \
                            IndicatorValue.objects.get_or_create(
                                indicator=indicator,
                                date=date_time,
                                geom_identifier=administration_code,
                                defaults={
                                    'value': value,
                                    'reference_layer': reference_layer,
                                    'admin_level': admin_level
                                }
                            )
                        if not created:
                            indicator_value.value = value
                            indicator_value.reference_layer = reference_layer
                            indicator_value.admin_level = admin_level

                        indicator_value.save()
                        for key, value in extra_data.items():
                            try:
                                IndicatorExtraValue.objects.get_or_create(
                                    indicator_value=indicator_value,
                                    name=key,
                                    value=record[value]
                                )
                            except IndexError:
                                pass

                    # check if error separator is in detail
                    if error_separator in json.dumps(detail):
                        success = False

                    # ----------------------------------------------------
                    # End of validation
                    # ---------------------------------------------------
                    details.append(detail)

                if not success:
                    self.log.detail = json.dumps(details)
                    raise HarvestingError(
                        'Progress did not success. '
                        'No data saved. '
                        'Please check the detail to fix the error.')
        else:
            raise HarvestingError(
                f'Sheet name : {self.attributes.get("sheet_name", "")} '
                f'does not exist.'
            )
