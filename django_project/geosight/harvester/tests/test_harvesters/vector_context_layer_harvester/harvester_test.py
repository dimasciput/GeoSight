"""Test for Harvester : VectorContextLayerHarvester."""

import responses

from geosight.harvester.harveters.vector_context_layer_harvester import (
    AGGREGATIONS, SPATIAL_METHOD
)
from geosight.harvester.models.harvester_log import LogStatus
from ._base import BaseVectorContextLayerHarvesterTest


class VectorContextLayerHarvesterTest(BaseVectorContextLayerHarvesterTest):
    """Test for Harvester : VectorContextLayerHarvester."""

    @responses.activate
    def assert_results(
            self, values: dict, filter: str,
            statial_method: str, aggregation_method: str
    ):
        """Assert results of harvester."""
        self.mock_requests()
        harvester = self.create_harvester(
            filter, statial_method, aggregation_method
        )
        rows = harvester.get_harvester_class(harvester).return_rows()
        for row in rows:
            self.assertEqual(row[0], values[row[1]])

        # Run the harvester and check values
        self.indicator.indicatorvalue_set.all().delete()
        harvester.run(True)
        log = harvester.harvesterlog_set.last()
        self.assertEqual(log.status, LogStatus.DONE)
        for value in self.indicator.indicatorvalue_set.all():
            self.assertEqual(value.value, values[value.geom_identifier])
            self.assertEqual(value.indicator, self.indicator)
            self.assertEqual(value.reference_layer, self.reference_layer)
            self.assertEqual(value.admin_level, self.admin_level)

    @responses.activate
    def test_harvester_intersect_count(self):
        """Test the harvester intersect and count."""
        self.assert_results(
            values={'AA': 3, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.COUNT
        )

    @responses.activate
    def test_harvester_completely_within_count(self):
        """Test the harvester completely within and count."""
        self.assert_results(
            values={'AA': 2, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.COMPLETELY_WITHIN,
            aggregation_method=AGGREGATIONS.COUNT
        )

    @responses.activate
    def test_harvester_centroid_within_count(self):
        """Test the harvester completely within and count."""
        self.assert_results(
            values={'AA': 2, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.CENTROID_WITHIN,
            aggregation_method=AGGREGATIONS.COUNT
        )

    @responses.activate
    def test_harvester_distance_within_count(self):
        """Test the harvester completely within and count."""
        self.assert_results(
            values={'AA': 3, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=100',
            aggregation_method=AGGREGATIONS.COUNT
        )
        self.assert_results(
            values={'AA': 45, 'BB': 25, 'CC': 20, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=100',
            aggregation_method=AGGREGATIONS.SUM + '(population)'
        )
        self.assert_results(
            values={'AA': 20, 'BB': 15, 'CC': 15, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=100',
            aggregation_method=AGGREGATIONS.MAX + '(population)'
        )
        self.assert_results(
            values={'AA': 10, 'BB': 10, 'CC': 5, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=100',
            aggregation_method=AGGREGATIONS.MIN + '(population)'
        )
        self.assert_results(
            values={'AA': 15, 'BB': 12.5, 'CC': 10, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=100',
            aggregation_method=AGGREGATIONS.AVG + '(population)'
        )

        # Distance to 1000km
        self.assert_results(
            values={'AA': 8, 'BB': 6, 'CC': 6, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=1000000',
            aggregation_method=AGGREGATIONS.COUNT
        )
        self.assert_results(
            values={'AA': 100, 'BB': 65, 'CC': 80, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=1000000',
            aggregation_method=AGGREGATIONS.SUM + '(population)'
        )
        self.assert_results(
            values={'AA': 20, 'BB': 15, 'CC': 20, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=1000000',
            aggregation_method=AGGREGATIONS.MAX + '(population)'
        )
        self.assert_results(
            values={'AA': 5, 'BB': 5, 'CC': 5, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=1000000',
            aggregation_method=AGGREGATIONS.MIN + '(population)'
        )
        self.assert_results(
            values={
                'AA': 12.5, 'BB': 10.833333333333334,
                'CC': 13.333333333333334, 'ZZ': 0
            },
            filter='',
            statial_method=SPATIAL_METHOD.DISTANCE_WITHIN + '=1000000',
            aggregation_method=AGGREGATIONS.AVG + '(population)'
        )

    @responses.activate
    def test_harvester_intersect_sum(self):
        """Test the harvester intersect and sum."""
        self.assert_results(
            values={'AA': 45, 'BB': 25, 'CC': 20, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.SUM + '(population)'
        )

    @responses.activate
    def test_harvester_intersect_max(self):
        """Test the harvester intersect and max."""
        self.assert_results(
            values={'AA': 20, 'BB': 15, 'CC': 15, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.MAX + '(population)'
        )

    @responses.activate
    def test_harvester_intersect_min(self):
        """Test the harvester intersect and min."""
        self.assert_results(
            values={'AA': 10, 'BB': 10, 'CC': 5, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.MIN + '(population)'
        )

    @responses.activate
    def test_harvester_intersect_avg(self):
        """Test the harvester intersect and average."""
        self.assert_results(
            values={'AA': 15, 'BB': 12.5, 'CC': 10, 'ZZ': 0},
            filter='',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.AVG + '(population)'
        )

    @responses.activate
    def test_harvester_intersect_count_filter(self):
        """Test the harvester intersect, count and filter."""
        # filter 1
        self.assert_results(
            values={'AA': 2, 'BB': 1, 'CC': 1, 'ZZ': 0},
            filter='population>10',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.COUNT
        )
        self.assert_results(
            values={'AA': 2, 'BB': 2, 'CC': 2, 'ZZ': 0},
            filter='population>10 OR male>2',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.COUNT
        )
        self.assert_results(
            values={'AA': 2, 'BB': 1, 'CC': 2, 'ZZ': 0},
            filter='population > 10 OR (male > 2 AND population <= 5)',
            statial_method=SPATIAL_METHOD.INTERSECT,
            aggregation_method=AGGREGATIONS.COUNT
        )
