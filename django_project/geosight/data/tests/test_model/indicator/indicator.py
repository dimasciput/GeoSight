""".Test for Indicator model."""
from django.test.testcases import TestCase

from geosight.data.models.indicator.indicator import Indicator
from geosight.data.tests.model_factories import (
    IndicatorF, IndicatorGroupF, IndicatorRuleF
)


class IndicatorTest(TestCase):
    """.Test for Indicator model."""

    def setUp(self):
        """To setup test."""
        self.name = 'Indicator 1'

    def test_create(self):
        """Test create."""
        group = IndicatorGroupF()

        indicator = IndicatorF(
            name=self.name,
            group=group
        )
        self.assertEquals(indicator.name, self.name)
        self.assertEquals(indicator.group, group)

    def test_list(self):
        """Test list method."""
        group = IndicatorGroupF()
        IndicatorF(name='Name 1', group=group)
        IndicatorF(name='Name 2', group=group)
        self.assertEquals(Indicator.objects.count(), 2)

    def test_rules(self):
        """Check rules."""
        indicator = IndicatorF(
            name='Name 1',
            group=IndicatorGroupF()
        )
        rules = [
            IndicatorRuleF(indicator=indicator, rule='x==1'),
            IndicatorRuleF(indicator=indicator, rule='x==2 or x==3'),
            IndicatorRuleF(indicator=indicator, rule='x>=4 and x<=5'),
            IndicatorRuleF(indicator=indicator, rule='x>5'),
            IndicatorRuleF(indicator=indicator, rule='x<5')
        ]
        for rule in rules:
            found = False
            color = ''
            for indicator_rule in indicator.rules_dict():
                if indicator_rule['name'] == rule.name:
                    found = True
                    color = indicator_rule['color']
            self.assertTrue(found)
            self.assertEquals(
                rule.color,
                color
            )
