"""Test for Harvester model."""
from django.test.testcases import TestCase

from geosight.data.tests.model_factories.indicator import IndicatorF
from geosight.harvester.models.harvester import ALL_HARVESTERS
from geosight.harvester.tests.model_factories import HarvesterF
from geosight.georepo.tests.model_factories import ReferenceLayerF


class HarvesterTest(TestCase):
    """Test for Harvester model."""

    def test_create(self):
        """Test create."""
        for harvester_class in ALL_HARVESTERS:
            reference_layer = ReferenceLayerF()
            harvester = HarvesterF(
                indicator=IndicatorF(),
                reference_layer=reference_layer,
                harvester_class=harvester_class[0]
            )
            self.assertFalse(harvester.is_run)
            self.assertTrue(harvester.active)
            self.assertEqual(harvester.harvester_class, harvester_class[0])
            self.assertEqual(harvester.reference_layer, reference_layer)

            default_attr = list(
                harvester.get_harvester_class.additional_attributes().keys()
            )
            default_attr.sort()
            harvester_attr = list(
                harvester.harvesterattribute_set.values_list('name', flat=True)
            )
            harvester_attr.sort()
            self.assertEqual(default_attr, harvester_attr)
