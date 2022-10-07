"""Base for test API."""
from django.test.testcases import TestCase

from core.models.preferences import SitePreferences
from geosight.data.tests.model_factories import (
    IndicatorF, IndicatorGroupF,
    IndicatorRuleF
)
from geosight.georepo.tests.model_factories import ReferenceLayerF


class BaseHarvesterTest(TestCase):
    """Base for test API."""

    admin_level = 1
    georepo_url = 'http://test.com'
    georepo_api_key = 'AAA'

    def setUp(self):
        """To setup tests."""
        preference = SitePreferences.preferences()
        preference.georepo_url = self.georepo_url
        preference.georepo_api_key = self.georepo_api_key
        preference.save()

        self.reference_layer = ReferenceLayerF()
        self.indicator = IndicatorF(
            group=IndicatorGroupF()
        )
        IndicatorRuleF(indicator=self.indicator, rule='x==1')
        IndicatorRuleF(indicator=self.indicator, rule='x==2')
        IndicatorRuleF(indicator=self.indicator, rule='x==3')
        IndicatorRuleF(indicator=self.indicator, rule='x==4')
