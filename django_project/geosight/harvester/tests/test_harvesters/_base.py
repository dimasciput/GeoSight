"""Base for test API."""
from django.test.testcases import TestCase

from geosight.data.tests.model_factories import (
    IndicatorF, IndicatorGroupF,
    IndicatorRuleF
)
from geosight.georepo.tests.model_factories import ReferenceLayerF


class BaseHarvesterTest(TestCase):
    """Base for test API."""

    admin_level = 1

    def setUp(self):
        """To setup tests."""
        self.reference_layer = ReferenceLayerF()
        self.indicator = IndicatorF(
            group=IndicatorGroupF()
        )
        IndicatorRuleF(indicator=self.indicator, rule='x==1')
        IndicatorRuleF(indicator=self.indicator, rule='x==2')
        IndicatorRuleF(indicator=self.indicator, rule='x==3')
        IndicatorRuleF(indicator=self.indicator, rule='x==4')
