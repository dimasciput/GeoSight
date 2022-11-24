"""Base for test API."""
from django.test.testcases import TestCase

from core.models.preferences import SitePreferences
from geosight.data.models.code import Code, CodeList, CodeInCodeList
from geosight.data.models.indicator import IndicatorType
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

        # For others indicator
        self.indicator_1 = IndicatorF(
            group=IndicatorGroupF(),
            shortcode='IND1',
            type=IndicatorType.INTEGER,
            min_value=0,
            max_value=7
        )
        self.indicator_2 = IndicatorF(
            group=IndicatorGroupF(),
            shortcode='IND2',
            type=IndicatorType.FLOAT,
            min_value=0,
            max_value=7
        )
        codelist, created = CodeList.objects.get_or_create(name='name')
        CodeInCodeList.objects.create(
            code=Code.objects.create(name='A', value='A'), codelist=codelist
        )
        CodeInCodeList.objects.create(
            code=Code.objects.create(name='B', value='B'), codelist=codelist
        )
        CodeInCodeList.objects.create(
            code=Code.objects.create(name='C', value='C'), codelist=codelist
        )
        CodeInCodeList.objects.create(
            code=Code.objects.create(name='D', value='D'), codelist=codelist
        )
        self.indicator_3 = IndicatorF(
            group=IndicatorGroupF(),
            shortcode='IND3',
            type=IndicatorType.STRING,
            codelist=codelist
        )
