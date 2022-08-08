"""Test for Harvester : APIWithGeograpyAndDate."""
import responses

from geosight.harvester.models.harvester import APIListWithGeographyAndDate
from geosight.harvester.tests.model_factories import HarvesterF
from geosight.harvester.tests.test_harvesters._base import BaseHarvesterTest


class APIWithGeograpyAndDateTest(BaseHarvesterTest):
    """Test for Harvester : APIWithGeograpyAndDate."""

    def test_no_attr_error(self):
        """Test run with no attribute error."""
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=APIListWithGeographyAndDate[0],
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
    def test_with_timestamp(self):
        """Test run with timestamp."""
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=APIListWithGeographyAndDate[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.save_attributes(
            {
                'api_url': 'http://test.com',
                'keys_for_list': "x['results']",
                'keys_for_geography_identifier': "x['geom_code']",
                'keys_for_value': "x['value']",
                'keys_for_date': "x['date']",
                'date_format': None
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
                        'value': 1,
                        'date': 1648000000
                    },
                    {
                        'geom_code': 'B',
                        'value': 2,
                        'date': 1647000000
                    },
                    {
                        'geom_code': 'C',
                        'value': 4,
                        'date': 1646000000
                    }
                ]
            }
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        # for non same admin
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())
        self.assertIsNone(values.filter(geom_identifier='B').first())
        self.assertIsNone(values.filter(geom_identifier='C').first())

        # for same admin
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(log.status, 'Done')
        self.assertEqual(
            values.get(geom_identifier='A').value, 1
        )
        self.assertEqual(
            values.get(geom_identifier='A').date.strftime("%Y-%m-%d"),
            "2022-03-23"
        )
        self.assertEqual(
            values.get(geom_identifier='B').value, 2
        )
        self.assertEqual(
            values.get(geom_identifier='B').date.strftime("%Y-%m-%d"),
            "2022-03-11"
        )
        self.assertEqual(
            values.get(geom_identifier='C').value, 4
        )
        self.assertEqual(
            values.get(geom_identifier='C').date.strftime("%Y-%m-%d"),
            "2022-02-27"
        )

    @responses.activate
    def test_run(self):
        """Test run."""
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=APIListWithGeographyAndDate[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.save_attributes(
            {
                'api_url': 'http://test.com',
                'keys_for_list': "x['results']",
                'keys_for_geography_identifier': "x['geom_code']",
                'keys_for_value': "x['value']",
                'keys_for_date': "x['date']",
                'date_format': "%Y-%m-%d"
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
                        'value': 1,
                        'date': "2010-01-01"
                    },
                    {
                        'geom_code': 'B',
                        'value': 2,
                        'date': "2011-01-01"
                    },
                    {
                        'geom_code': 'C',
                        'value': 4,
                        'date': "2013-01-01"
                    }
                ]
            }
        )
        harvester.run()
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, 'Done')

        # for non same admin
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())
        self.assertIsNone(values.filter(geom_identifier='B').first())
        self.assertIsNone(values.filter(geom_identifier='C').first())

        # for same admin
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )

        self.assertEqual(
            values.get(geom_identifier='A').value, 1
        )
        self.assertEqual(
            values.get(geom_identifier='A').date.strftime("%Y-%m-%d"),
            "2010-01-01"
        )
        self.assertEqual(
            values.get(geom_identifier='B').value, 2
        )
        self.assertEqual(
            values.get(geom_identifier='B').date.strftime("%Y-%m-%d"),
            "2011-01-01"
        )
        self.assertEqual(
            values.get(geom_identifier='C').value, 4
        )
        self.assertEqual(
            values.get(geom_identifier='C').date.strftime("%Y-%m-%d"),
            "2013-01-01"
        )
