"""Test for Harvester : APIWithGeograpyAndTodayDate."""
import datetime

import responses

from geosight.harvester.models.harvester import APIWithGeographyAndTodayDate
from geosight.harvester.tests.model_factories import HarvesterF
from geosight.harvester.tests.test_harvesters._base import BaseHarvesterTest


class APIWithGeograpyAndTodayDateTest(BaseHarvesterTest):
    """Test for Harvester : APIWithGeograpyAndTodayDate."""

    def test_no_attr_error(self):
        """Test run with no attribute error."""
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=APIWithGeographyAndTodayDate[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, 'Error')
        self.assertEqual(
            log.note, list(
                harvester.get_harvester_class.additional_attributes().keys()
            )[0] + ' is required and it is empty'
        )

    @responses.activate
    def test_run(self):
        """Test run."""
        today = datetime.datetime.today().date()
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=APIWithGeographyAndTodayDate[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.save_attributes(
            {
                'api_url': 'http://test.com',
                'keys_for_list': "x['results']",
                'keys_for_geography_identifier': "x['geom_code']",
                'keys_for_value': "x['value']"
            }
        )
        harvester.save_mapping(
            {
                'A': 'A',
                'B': 'B',
                'C': 'C',
            }
        )
        responses.add(
            responses.GET,
            'http://test.com',
            status=200,
            json={
                'results': [
                    {
                        'geom_code': 'A',
                        'value': 1
                    },
                    {
                        'geom_code': 'B',
                        'value': 2
                    },
                    {
                        'geom_code': 'C',
                        'value': 4
                    }
                ]
            }
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, 'Done')

        # for non same level
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())
        self.assertIsNone(values.filter(geom_identifier='B').first())
        self.assertIsNone(values.filter(geom_identifier='C').first())

        # for same level
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        self.assertEqual(
            values.get(geom_identifier='A').value, 1
        )
        self.assertEqual(
            values.get(geom_identifier='A').date, today
        )
        self.assertEqual(
            values.get(geom_identifier='B').value, 2
        )
        self.assertEqual(
            values.get(geom_identifier='B').date, today
        )
        self.assertEqual(
            values.get(geom_identifier='C').value, 4
        )
        self.assertEqual(
            values.get(geom_identifier='C').date, today
        )
