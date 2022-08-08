"""Test for Harvester : UsingExposedAPI."""
import datetime

from django.test import Client

from geosight.harvester.models.harvester import UsingExposedAPI
from geosight.harvester.tests.model_factories import HarvesterF
from geosight.harvester.tests.test_harvesters._base import BaseHarvesterTest


class UsingExposedAPITest(BaseHarvesterTest):
    """Test for Harvester : APIWithGeograpyAndDate."""

    def setUp(self):
        """To setup tests."""
        BaseHarvesterTest.setUp(self)
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=UsingExposedAPI[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        self.token = harvester.harvesterattribute_set.get(name='token').value
        self.url = harvester.harvesterattribute_set.get(name='API URL').value

    def test_push_data_no_login(self):
        """Test Push data with no login."""
        client = Client()
        response = client.post(self.url)
        self.assertEquals(response.status_code, 401)

    def test_push_data_with_token_no_data(self):
        """Test Push data with no data."""
        client = Client()
        response = client.post(
            self.url, **{'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        )
        self.assertEquals(response.status_code, 400)

    def test_push_data_with(self):
        """Test Push data."""
        client = Client()
        today = datetime.datetime.today().date()
        data = {
            "geometry_code": "A",
            "extra_data": {
                "Extra": "1"
            },
            "date": today.strftime("%Y-%m-%d"),
            "value": 1
        }
        response = client.post(
            self.url, data=data,
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        )
        self.assertEquals(response.status_code, 200)

        # for non same level
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())

        # for same level
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        self.assertEqual(
            values.get(geom_identifier='A').value, 1
        )
        self.assertEqual(
            values.get(geom_identifier='A').date,
            today
        )

    def test_push_batch_data_with(self):
        """Test Push data in batch."""
        client = Client()
        today = datetime.datetime.today().date()
        data = [
            {
                "geometry_code": "A",
                "extra_data": {
                    "Extra": "1"
                },
                "date": today.strftime("%Y-%m-%d"),
                "value": 1
            },
            {
                "geometry_code": "B",
                "extra_data": {
                    "Extra": "1"
                },
                "date": today.strftime("%Y-%m-%d"),
                "value": 2
            },
            {
                "geometry_code": "C",
                "extra_data": {
                    "Extra": "1"
                },
                "date": today.strftime("%Y-%m-%d"),
                "value": 4
            }
        ]
        response = client.post(
            self.url + '/batch', data=data,
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        )
        self.assertEquals(response.status_code, 200)

        # for non same level
        values = self.indicator.query_values(
            reference_layer=self.reference_layer,
            admin_level=self.admin_level + 1
        )

        self.assertIsNone(values.filter(geom_identifier='A').first())

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
