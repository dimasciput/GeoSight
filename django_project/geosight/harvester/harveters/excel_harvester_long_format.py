"""Harvest data from spreadsheet for multi indicator."""
import json
from datetime import datetime, date

from django.db import transaction
from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get

from geosight.data.models import Indicator, IndicatorValue
from geosight.harvester.harveters._base import BaseHarvester, HarvestingError


class ExcelHarvesterLongFormat(BaseHarvester):
    """Harvest data from spreadsheet for multi indicator."""

    description = (
        "Harvest data from spreadsheet for multi indicator. "
        "<br>Create data in the spreadsheet with the name of "
        "indicator as the column name."
        "<br>Select what sheet name should be use and select "
        "what column name that will be used for specific indicator."
    )

    @staticmethod
    def additional_attributes(**kwargs) -> dict:
        """Return additional attributes."""
        attr = {
            'file': {
                'title': "URL of file",
                'description': (
                    "The url of file that will be downloaded to be harvested"
                )
            },
            'sheet_name': {
                'title': "Sheet name",
                'description': "Sheet that will be used",
                'type': 'select'
            },
            'row_number_for_header': {
                'title': "Row Number: Header",
                'description': "Row number that will be used as header.",
                'type': 'number'
            },
            'column_name_administration_code': {
                'title': "Column Name: Administration Code",
                'description': (
                    "The name of column in "
                    "the file contains administration code"
                ),
                'type': 'select'
            },
            'column_name_indicator_shortcode': {
                'title': "Column Name: Indicator Shortcode",
                'description': (
                    "The name of column in "
                    "the file contains shortcode of indicator."
                ),
                'type': 'select'
            },
            'column_name_value': {
                'title': "Column Name: value of data",
                'description': (
                    "The name of column in "
                    "the file contains value of data."
                ),
                'type': 'select'
            },
            'column_name_date': {
                'title': "Column Name: Date of data",
                'description': (
                    "The name of column in "
                    "the file contains date of data."
                ),
                'type': 'select'
            }
        }
        return attr

    def get_records(self):
        """Get records form upload session."""
        _file_attr = self.harvester.harvesterattribute_set.get(name='file')
        _file = _file_attr.file

        records = []
        if _file:
            _file.seek(0)
        elif _file_attr.value:
            _file = _file_attr.value
        else:
            raise HarvestingError('File is not found')

        sheet = None
        if str(_file).split('.')[-1] == 'xls':
            sheet = xls_get(_file)
        elif str(_file).split('.')[-1] == 'xlsx':
            sheet = xlsx_get(_file)
        if sheet:
            try:
                records = sheet[self.attributes.get('sheet_name', '')]
            except KeyError:
                raise HarvestingError(
                    f'Sheet name : {self.attributes.get("sheet_name", "")}'
                    f' does not exist.'
                )
        return records

    def check_attr(self, headers, attr_name):
        """Check and return attr."""
        try:
            return headers.index(self.attributes[attr_name])
        except ValueError as e:
            if 'not in list' in str(e):
                raise HarvestingError(str(e).replace(
                    'is not in list', '') + ' column is not found')

    def _process(self):
        """Run the harvester."""
        harvester = self.harvester
        reference_layer = harvester.reference_layer
        admin_level = harvester.admin_level
        default_attr = ExcelHarvesterLongFormat.additional_attributes()

        # fetch data
        self._update('Fetching data')

        # format data
        row_number_for_header = 'row_number_for_header'
        try:
            column_header = int(self.attributes[row_number_for_header])
        except ValueError:
            raise HarvestingError(
                f"{default_attr[row_number_for_header]['title']} "
                f"is not an integer"
            )

        records = self.get_records()[column_header - 1:]
        headers = records[0]

        # get keys
        column_name_administration_code = self.check_attr(
            headers, 'column_name_administration_code'
        )
        column_name_indicator_shortcode = self.check_attr(
            headers, 'column_name_indicator_shortcode'
        )
        column_name_value = self.check_attr(headers, 'column_name_value')
        column_name_date = self.check_attr(headers, 'column_name_date')

        # Save the data in atomic
        # When 1 is error, we need to raise exeptions
        success = True
        details = []
        error_separator = ':error:'
        with transaction.atomic():
            details.append(headers)
            total = len(records[1:])
            for record_idx, record in enumerate(records[1:]):
                self._update(
                    f'Processing line {record_idx + column_header}/'
                    f'{total + column_header}'
                )
                detail = [str(r) for r in record]
                administrative_code = record[column_name_administration_code]
                indicator_shortcode = record[column_name_indicator_shortcode]
                date_data = record[column_name_date]

                # Check requirements
                if not administrative_code:
                    detail[column_name_administration_code] += (
                        f'{error_separator}This is required'
                    )

                if not indicator_shortcode:
                    detail[column_name_indicator_shortcode] += (
                        f'{error_separator}This is required'
                    )

                if not date_data:
                    detail[column_name_date] += (
                        f'{error_separator}This is required'
                    )

                # Format date
                if not isinstance(date_data, date):
                    try:
                        date_data = datetime.strptime(
                            date_data, "%Y-%m-%d"
                        ).date()
                    except ValueError:
                        detail[column_name_date] += (
                            f'{error_separator}Date is not in format %Y-%m-%d'
                        )

                # Cast value to float
                try:
                    value = record[column_name_value]
                except IndexError:
                    value = None
                if value is None or value == '':
                    continue
                try:
                    value = float(value)
                except ValueError:
                    detail[column_name_value] += (
                        f'{error_separator}Value is not float'
                    )

                # If no error, save the data
                if error_separator not in json.dumps(detail):
                    try:
                        indicator_value, created = \
                            IndicatorValue.objects.get_or_create(
                                indicator=Indicator.objects.get(
                                    shortcode=indicator_shortcode
                                ),
                                date=date_data,
                                geom_identifier=administrative_code,
                                defaults={
                                    'value': value,
                                    'reference_layer': reference_layer,
                                    'admin_level': admin_level
                                }
                            )
                        indicator_value.value = value
                        indicator_value.save()
                    except Indicator.DoesNotExist:
                        detail[column_name_indicator_shortcode] += (
                            f'{error_separator}Indicator does not exist'
                        )

                # check if error separator is in detail
                if error_separator in json.dumps(detail):
                    success = False

                # -----------------------------------------------------------------------
                # End of validation
                # -----------------------------------------------------------------------
                details.append(detail)

            if not success:
                self.log.detail = json.dumps(details)
                raise HarvestingError(
                    'Progress did not success. No data saved. '
                    'Please check the detail to fix the error.'
                )
