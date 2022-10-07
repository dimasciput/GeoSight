"""Test for Base Harvester : VectorContextLayerHarvester Base."""

import json
import os

import responses

from core.settings.utils import ABS_PATH
from geosight.data.tests.model_factories import ContextLayerF
from geosight.georepo.tests.model_factories import ReferenceLayerF
from geosight.harvester.models.harvester import VectorContextLayerHarvester
from geosight.harvester.tests.model_factories import HarvesterF
from geosight.harvester.tests.test_harvesters._base import BaseHarvesterTest


class BaseVectorContextLayerHarvesterTest(BaseHarvesterTest):
    """Test for Base Harvester : VectorContextLayerHarvester."""

    databases = {'default', 'temp'}
    admin_level = 0
    reference_layer_identifier = 'test'
    arcgis_test_url = 'http://arcgis_test.com'
    responses_folder = ABS_PATH(
        'geosight', 'harvester', 'tests', 'test_harvesters',
        'vector_context_layer_harvester', 'responses'
    )

    def setUp(self):
        """To setup tests."""
        BaseHarvesterTest.setUp(self)
        self.context_layer = ContextLayerF(
            name='Conflict events',
            url=self.arcgis_test_url
        )
        self.reference_layer = ReferenceLayerF(
            identifier=self.reference_layer_identifier
        )

    # ---------------------------------------------------------
    # Functions
    # ---------------------------------------------------------
    def create_harvester(
            self, filter_query: str, spatial_operator: str, aggregation: str
    ):
        """Create harvester."""
        harvester = HarvesterF(
            indicator=self.indicator,
            harvester_class=VectorContextLayerHarvester[0],
            reference_layer=self.reference_layer,
            admin_level=self.admin_level
        )
        harvester.save_attributes(
            {
                'context_layer_id': self.context_layer.id,
                'geometry_type': 'point',
                'filter': filter_query,
                'spatial_operator': spatial_operator,
                'aggregation': aggregation
            }
        )
        return harvester

    def mock_request(self, url, response_file):
        """Mock response with file."""
        responses.add(
            responses.GET,
            url,
            status=200,
            json=json.loads(open(response_file, "r").read())
        )

    def mock_requests(self):
        """Mock requests."""
        # Reference Layer
        self.mock_request(
            (
                f'{self.georepo_url}/api/reference-layer/'
                f'{self.reference_layer_identifier}?'
                f'token={self.georepo_api_key}&cached=False'
            ),
            os.path.join(self.responses_folder, 'georepo_ref_detail.json')
        )

        # Geojson page 1
        self.mock_request(
            (
                f'{self.georepo_url}/api/reference-layer/'
                f'{self.reference_layer_identifier}/top?page=1'
            ),
            os.path.join(self.responses_folder, 'georepo_geojson_1.json')
        )

        # Geojson page 2
        self.mock_request(
            (
                f'{self.georepo_url}/api/reference-layer/'
                f'{self.reference_layer_identifier}/top?page=2'
            ),
            os.path.join(self.responses_folder, 'georepo_geojson_2.json')
        )

        # Arcgis definition
        self.mock_request(
            f'{self.arcgis_test_url}?f=json',
            os.path.join(self.responses_folder, 'arcgis_definition.json')
        )

        # Arcgis data
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%200.0,%20%22ymin%22:%200.0,'
                f'%20%22xmax%22:%2020.0,%20%22ymax%22:%2020.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=0&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_1.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%200.0,%20%22ymin%22:%200.0,'
                f'%20%22xmax%22:%2020.0,%20%22ymax%22:%2020.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=100&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_2.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%200.0,%20%22ymin%22:%200.0,'
                f'%20%22xmax%22:%2020.0,%20%22ymax%22:%2020.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=200&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_3.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%200.0,%20%22ymin%22:%200.0,'
                f'%20%22xmax%22:%2020.0,%20%22ymax%22:%2020.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=300&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_4.json')
        )

        # this is for dwithin
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%20-10.0,%20%22ymin%22:%20-10.0,'
                f'%20%22xmax%22:%2030.0,%20%22ymax%22:%2030.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=0&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_1.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%20-10.0,%20%22ymin%22:%20-10.0,'
                f'%20%22xmax%22:%2030.0,%20%22ymax%22:%2030.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=100&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_2.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%20-10.0,%20%22ymin%22:%20-10.0,'
                f'%20%22xmax%22:%2030.0,%20%22ymax%22:%2030.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=200&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_3.json')
        )
        self.mock_request(
            (
                f'{self.arcgis_test_url}/query?'
                f'where=1=1&returnGeometry=true&outSR=4326&outFields=*&'
                f'inSR=4326&geometryType=esriGeometryEnvelope&f=geojson&'
                f'geometry=%7B%22xmin%22:%20-10.0,%20%22ymin%22:%20-10.0,'
                f'%20%22xmax%22:%2030.0,%20%22ymax%22:%2030.0,%20%22'
                f'spatialReference%22:%20%7B%22wkid%22:%204326%7D%7D&'
                f'resultOffset=300&resultRecordCount=100'
            ),
            os.path.join(self.responses_folder, 'arcgis_geojson_4.json')
        )
