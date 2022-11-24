"""Test for Harvester : ExcelHarvester."""
from core.settings.utils import ABS_PATH
from geosight.harvester.models.harvester import (
    ExcelHarvesterLongFormatHarvester
)
from geosight.harvester.tests.model_factories import HarvesterF
from geosight.harvester.tests.test_harvesters._base import BaseHarvesterTest


class ExcelHarvesterTest(BaseHarvesterTest):
    """Test for Harvester : ExcelHarvester."""

    def test_no_attr_error(self):
        """Test run with no attribute error."""
        harvester = HarvesterF(
            harvester_class=ExcelHarvesterLongFormatHarvester[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, 'Error')
        self.assertEqual(
            log.note, 'file is required and it is empty'
        )

    def test_run_error(self):
        """Test run."""
        filepath = ABS_PATH(
            'geosight', 'harvester', 'tests', 'test_harvesters',
            'fixtures', 'excel_long_test_error.xlsx'
        )
        harvester = HarvesterF(
            harvester_class=ExcelHarvesterLongFormatHarvester[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.save_default_attributes()
        harvester.save_attributes(
            {
                'file': filepath,
                'sheet_name': 'Sheet 1',
                'row_number_for_header': 1,
                'column_name_administration_code': 'geom_code',
                'column_name_indicator_shortcode': 'indicator_shortcode',
                'column_name_value': 'value',
                'column_name_date': 'date',

            }
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, 'Error')

    def test_run_done(self):
        """Test run."""
        filepath = ABS_PATH(
            'geosight', 'harvester', 'tests', 'test_harvesters',
            'fixtures', 'excel_long_test.xlsx'
        )
        harvester = HarvesterF(
            harvester_class=ExcelHarvesterLongFormatHarvester[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.save_default_attributes()
        harvester.save_attributes(
            {
                'file': filepath,
                'sheet_name': 'Sheet 1',
                'row_number_for_header': 1,
                'column_name_administration_code': 'geom_code',
                'column_name_indicator_shortcode': 'indicator_shortcode',
                'column_name_value': 'value',
                'column_name_date': 'date',

            }
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, 'Done')

        # Check for indicator 1
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())
        self.assertIsNone(values.filter(geom_identifier='B').first())
        self.assertIsNone(values.filter(geom_identifier='C').first())

        # for same level
        values = self.indicator_1.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_identifier='A').val, 1
        )
        self.assertEqual(
            values.get(geom_identifier='A').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_identifier='B').val, 2
        )
        self.assertEqual(
            values.get(geom_identifier='B').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_identifier='C').val, 3
        )
        self.assertEqual(
            values.get(geom_identifier='C').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )

        # Check for indicator 2
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())
        self.assertIsNone(values.filter(geom_identifier='B').first())
        self.assertIsNone(values.filter(geom_identifier='C').first())

        # for same level
        values = self.indicator_2.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_identifier='A').val, 4.5
        )
        self.assertEqual(
            values.get(geom_identifier='A').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_identifier='B').val, 5.5
        )
        self.assertEqual(
            values.get(geom_identifier='B').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_identifier='C').val, 6.5
        )
        self.assertEqual(
            values.get(geom_identifier='C').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )

        # Check for indicator 3
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())
        self.assertIsNone(values.filter(geom_identifier='B').first())
        self.assertIsNone(values.filter(geom_identifier='C').first())

        # for same level
        values = self.indicator_3.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_identifier='A').val, 'A'
        )
        self.assertEqual(
            values.get(geom_identifier='A').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_identifier='B').val, 'B'
        )
        self.assertEqual(
            values.get(geom_identifier='B').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
        self.assertEqual(
            values.get(geom_identifier='C').val, 'C'
        )
        self.assertEqual(
            values.get(geom_identifier='C').date.strftime("%Y-%m-%d"),
            '2010-01-01'
        )
