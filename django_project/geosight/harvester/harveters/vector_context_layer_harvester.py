"""Harvester from Vector of Context Layer."""
import json
from datetime import datetime

from django.contrib.gis.geos import GEOSGeometry
from django.db import connections
from django.utils import timezone

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.harvester.harveters._base import BaseHarvester, HarvestingError


class AGGREGATIONS(object):
    """Aggregation query."""

    COUNT = 'COUNT'
    SUM = 'SUM'
    MIN = 'MIN'
    MAX = 'MAX'
    AVG = 'AVG'


class SPATIAL_METHOD(object):
    """Aggregation query."""

    INTERSECT = 'INTERSECT'
    COMPLETELY_WITHIN = 'COMPLETELY WITHIN'
    CENTROID_WITHIN = 'CENTROID WITHIN'
    DISTANCE_WITHIN = 'DISTANCE WITHIN'


class SPATIAL_METHOD_STRING(object):
    """Aggregation query string."""

    INTERSECT = 'Intersect'
    COMPLETELY_WITHIN = 'Completely within'
    CENTROID_WITHIN = 'Centroid within'
    DISTANCE_WITHIN = 'Within'


class VectorContextLayerHarvester(BaseHarvester):
    """Harvester from Vector of Context Layer.

    Harvester that will fetch the data from ArcGIS or geojson Context Layer
    And do attribute and spatial filter and do aggregation.
    """

    description = (
        "Harvester to fetch the data from vector context layer "
        "by doing attribute and spatial operator."
    )

    @staticmethod
    def additional_attributes(**kwargs) -> dict:
        """Return additional attributes."""
        return {
            'context_layer_id': {
                'title': "Context Layer ID",
                'description': (
                    "Context layer id that will be used."
                )
            },
            'geometry_type': {
                'title': "The type of geometry data.",
                'description': (
                    "Geometry type in data that will be fetched. "
                    "If it is empty, it will use all geometry type."
                ),
                'type': 'select',
                'options': ["Point", "Line", "Polygon"],
                'required': False
            },
            'filter': {
                'title': "Filter for the data.",
                'description': (
                    "Filter query for the data that will be put as 'where'."
                ),
                'required': False
            },
            'spatial_operator': {
                'title': "Spatial operator for the data.",
                'description': (
                    "Spatial operator that will be used to determine "
                    "the geometry of data."
                )
            },
            'aggregation': {
                'title': "Aggregation data for value.",
                'description': (
                    "Aggregation data per geometry "
                    "that will be used to determine the value of the geometry."
                ),
                'required': True
            },
        }

    def _process(self):
        """To run the harvester."""
        date = timezone.now().date()
        rows = self.return_rows()
        self._update('Save data.')
        for row in rows:
            self.save_indicator_data(
                value=row[0], geometry=row[1], date=date
            )

    @property
    def geometry_table_name(self):
        """Return table name of geometry."""
        fb_identifier = str(self.harvester.unique_id).replace('-', '_')
        return f'geometry_{fb_identifier}'

    @property
    def data_table_name(self):
        """Return table name of data."""
        fb_identifier = str(self.harvester.unique_id).replace('-', '_')
        return f'data_{fb_identifier}'

    def delete_tables(self):
        """Delete all tables from database."""
        self.cursor.execute(f'DROP TABLE IF EXISTS {self.geometry_table_name}')
        self.cursor.execute(f'DROP TABLE IF EXISTS {self.data_table_name}')

    def insert_features(self, features: list, table_name: str, fields: list):
        """Insert features to table."""
        # -------------------------------------------------
        # Create table
        fields.append({
            'name': '_row_',
            'type': 'INT'
        })
        table_definition = []
        for field in fields:
            table_definition.append(f'{field["name"]} {field["type"]}')
        definition = str(tuple(table_definition)).replace("'", "")
        self.cursor.execute(f'CREATE TABLE {table_name} {definition}')
        # -------------------------------------------------
        for idx, feature in enumerate(features):
            geom = GEOSGeometry(json.dumps(feature['geometry']))
            properties = feature['properties']
            properties['geom'] = geom.wkt
            properties['_row_'] = idx
            try:
                properties['code'] = properties['identifier']['admin']
            except KeyError:
                pass
            values = []
            for field in fields:
                value = properties[field['name']]
                if field['type'] == 'DATE':
                    value = datetime.fromtimestamp(
                        value / 1000).strftime("%Y-%m-%d")
                try:
                    value = value.replace("'", "''")
                except Exception:
                    pass
                values.append(value)
            values_str = str(tuple(values)).replace('"', "'")
            self.cursor.execute(
                f'INSERT INTO {table_name} VALUES {values_str}'
            )

    def return_rows(self) -> list:
        """Return rows of data."""
        try:
            with connections['temp'].cursor() as cursor:
                self.cursor = cursor
                self.delete_tables()
                rows = self._return_rows()
                self.delete_tables()
                return rows
        except Exception as e:
            with connections['temp'].cursor() as cursor:
                self.cursor = cursor
                self.delete_tables()
            raise Exception(e)

    def _return_rows(self):
        """Run processing harvester."""
        spatial_operator = self.attributes['spatial_operator']
        filter = self.attributes['filter']
        aggregation = self.attributes['aggregation']
        context_layer_id = self.attributes['context_layer_id']
        try:
            context_layer = ContextLayer.objects.get(id=context_layer_id)
            if context_layer.layer_type not in [
                LayerType.ARCGIS, LayerType.GEOJSON]:
                raise HarvestingError(
                    f"Harvester can't run type {context_layer.layer_type}."
                )

        except ContextLayer.DoesNotExist:
            raise HarvestingError(
                f'Context layer with ID {context_layer_id} does not exist.'
            )

        # ------------------------------------------
        # Create and save geometry table
        self._update('Fetching geometry data.')
        geometry = self.harvester.reference_layer.geojson(
            self.harvester.admin_level
        )
        self.insert_features(
            features=geometry['features'],
            table_name=self.geometry_table_name,
            fields=[
                {
                    'name': 'code',
                    'type': 'VARCHAR'
                },
                {
                    'name': 'geom',
                    'type': 'geometry'
                }
            ]
        )
        self.cursor.execute(
            f'SELECT ST_AsText(ST_SetSRID(ST_Extent(geom),4268)) '
            f'FROM {self.geometry_table_name}'
        )
        row = self.cursor.fetchone()
        bbox = list(GEOSGeometry(row[0]).extent)

        # If is it distance within, need to widen the bbox
        spatial_operator_method = spatial_operator.split('=')[0]
        if spatial_operator_method == SPATIAL_METHOD.DISTANCE_WITHIN:
            bbox[0] -= 10
            bbox[1] -= 10
            bbox[2] += 10
            bbox[3] += 10

        # -------------------------------------------------
        # Create and save data to table
        self._update('Fetching context layer data.')
        data = context_layer.geojson(bbox=bbox)
        definition = context_layer.arcgis_definition.json()
        fields = [{
            'name': 'geom',
            'type': 'geometry'
        }]

        for field in definition['fields']:
            field_type = field['type']
            column_name = field['name']
            if field_type in ['esriFieldTypeOID', 'esriFieldTypeInteger']:
                column_type = 'INT'
            elif field_type == 'esriFieldTypeDouble':
                column_type = 'DOUBLE PRECISION'
            elif field_type == 'esriFieldTypeDate':
                column_type = 'DATE'
            else:
                column_type = 'VARCHAR'

            fields.append({
                'name': column_name,
                'type': column_type
            })

        self.insert_features(
            features=data['features'],
            table_name=self.data_table_name,
            fields=fields
        )

        # -------------------------------------------------------
        # Construct query for returning rows
        # -------------------------------------------------------
        self._update('Querying data.')
        # FOR AGGREGATION, IT IS REQUIRED
        aggregation_method = aggregation.split('(')[0]
        try:
            aggregation_field = aggregation.split('(')[1].replace(')', '')
        except IndexError:
            aggregation_field = None

        aggregation_query = None
        if aggregation_method:
            aggregation_method = aggregation_method.upper()
            if aggregation_method == AGGREGATIONS.COUNT:
                aggregation_query = 'COUNT(geom.code)'
            elif aggregation_method in [
                AGGREGATIONS.SUM, AGGREGATIONS.MIN,
                AGGREGATIONS.MAX, AGGREGATIONS.AVG
            ]:
                if not aggregation_field:
                    raise HarvestingError(
                        f'Aggregation {aggregation_method} needs field.'
                    )
                aggregation_query = (
                    f'{aggregation_method.upper()}(data.{aggregation_field})'
                )
            else:
                raise HarvestingError(
                    f'Aggregation {aggregation_method} is not recognized.'
                )
        if not aggregation_query:
            raise HarvestingError('Aggregation is required.')

        # -------------------------------------------------------
        # FOR SPATIAL OPERATOR
        spatial_operator_method = spatial_operator.split('=')[0]
        try:
            spatial_operator_value = spatial_operator.split('=')[1]
        except IndexError:
            spatial_operator_value = None

        filters = []
        if filter:
            filters.append(f'({filter})')

        if spatial_operator_method:
            spatial_operator_method = spatial_operator_method.upper()
            if spatial_operator_method == SPATIAL_METHOD.INTERSECT:
                filters.append('ST_Intersects(data.geom, geom.geom)')
            elif spatial_operator_method == SPATIAL_METHOD.COMPLETELY_WITHIN:
                filters.append('ST_Within(data.geom, geom.geom)')
            elif spatial_operator_method == SPATIAL_METHOD.CENTROID_WITHIN:
                filters.append('ST_Within(ST_Centroid(data.geom), geom.geom)')
            elif spatial_operator_method == SPATIAL_METHOD.DISTANCE_WITHIN:
                # Special query for this distance within
                if not spatial_operator_value:
                    raise HarvestingError(
                        f'Spatial operator {spatial_operator_method} '
                        f'needs distance.'
                    )
                try:
                    distance = int(spatial_operator_value)
                    aggregation_query = aggregation_query.replace(
                        'geom.', 'data.')
                    query = (
                        f"SELECT {aggregation_query} as value, data.code "
                        "FROM ("
                        "SELECT distinct on (data._row_) * "
                        f"from {self.data_table_name} data "
                        f"CROSS JOIN {self.geometry_table_name} geom "
                        f"WHERE ST_DWithin(data.geom, geom.geom, {distance}) "
                        f"{' AND ' + filter if filter else ''}"
                        "ORDER BY data._row_, "
                        "ST_Distance(data.geom, geom.geom) ASC"
                        ") data "
                        "GROUP BY data.code"
                    )
                    self.cursor.execute(query)
                    rows = self.cursor.fetchall()
                    return rows
                except ValueError:
                    raise HarvestingError(
                        f'Distance {spatial_operator_value} is not integer.'
                    )

            else:
                raise HarvestingError(
                    f'Spatial operator {spatial_operator_method} '
                    f'is not recognized.'
                )

        # Construct query
        query = (
            f"SELECT {aggregation_query} as value, geom.code "
            f"from {self.data_table_name} data "
            f"CROSS JOIN {self.geometry_table_name} geom "
            f"{'WHERE ' + ' AND '.join(filters) if filters else ''} "
            "GROUP BY geom.code"
        )
        self.cursor.execute(query)
        rows = self.cursor.fetchall()
        return rows
