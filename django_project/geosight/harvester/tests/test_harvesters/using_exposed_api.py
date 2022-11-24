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

    def test_push_data_indicator_integer(self):
        """Test Push data."""
        harvester = HarvesterF(
            indicator=self.indicator_1,
            harvester_class=UsingExposedAPI[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        token = harvester.harvesterattribute_set.get(name='token').value
        url = harvester.harvesterattribute_set.get(name='API URL').value

        client = Client()
        today = datetime.datetime.today().date()
        response = client.post(
            url, data={
                "geometry_code": "A",
                "date": today.strftime("%Y-%m-%d"),
                "value": 1
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 200)
        self.assertEquals(self.indicator_1.indicatorvalue_set.last().val, 1)
        response = client.post(
            url, data={
                "geometry_code": "B",
                "date": today.strftime("%Y-%m-%d"),
                "value": 1.1
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 400)
        self.assertEquals(response.content, b'Value is not integer')
        response = client.post(
            url, data={
                "geometry_code": "C",
                "date": today.strftime("%Y-%m-%d"),
                "value": 'A'
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 400)
        self.assertEquals(response.content, b'Value is not integer')

    def test_push_data_indicator_float(self):
        """Test Push data."""
        harvester = HarvesterF(
            indicator=self.indicator_2,
            harvester_class=UsingExposedAPI[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        token = harvester.harvesterattribute_set.get(name='token').value
        url = harvester.harvesterattribute_set.get(name='API URL').value

        client = Client()
        today = datetime.datetime.today().date()
        response = client.post(
            url, data={
                "geometry_code": "A",
                "date": today.strftime("%Y-%m-%d"),
                "value": 1.1
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 200)
        self.assertEquals(self.indicator_2.indicatorvalue_set.last().val, 1.1)
        response = client.post(
            url, data={
                "geometry_code": "B",
                "date": today.strftime("%Y-%m-%d"),
                "value": 1
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 200)
        self.assertEquals(
            self.indicator_2.indicatorvalue_set.filter(
                geom_identifier='B').first().val, 1
        )
        response = client.post(
            url, data={
                "geometry_code": "C",
                "date": today.strftime("%Y-%m-%d"),
                "value": 'A'
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 400)
        self.assertEquals(response.content, b'Value is not float')

    def test_push_data_indicator_string(self):
        """Test Push data."""
        harvester = HarvesterF(
            indicator=self.indicator_3,
            harvester_class=UsingExposedAPI[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        token = harvester.harvesterattribute_set.get(name='token').value
        url = harvester.harvesterattribute_set.get(name='API URL').value

        client = Client()
        today = datetime.datetime.today().date()
        response = client.post(
            url, data={
                "geometry_code": "A",
                "date": today.strftime("%Y-%m-%d"),
                "value": 'A'
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 200)
        self.assertEquals(self.indicator_3.indicatorvalue_set.last().val, 'A')
        response = client.post(
            url, data={
                "geometry_code": "B",
                "date": today.strftime("%Y-%m-%d"),
                "value": 1
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 400)
        self.assertEquals(response.content, b'Value is not string')
        response = client.post(
            url, data={
                "geometry_code": "C",
                "date": today.strftime("%Y-%m-%d"),
                "value": 1.1
            },
            content_type='application/json',
            **{'HTTP_AUTHORIZATION': f'Bearer {token}'}
        )
        self.assertEquals(response.status_code, 400)
        self.assertEquals(response.content, b'Value is not string')

    def test_push_data_with_token(self):
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
