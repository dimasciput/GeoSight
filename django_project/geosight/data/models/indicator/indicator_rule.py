"""Contains Indicator Rule model."""
from django.contrib.gis.db import models

from geosight.data.models.indicator.indicator import Indicator
from geosight.data.models.rule import RuleModel


class IndicatorRule(RuleModel):
    """The rule of indicator."""

    indicator = models.ForeignKey(
        Indicator,
        on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('indicator', 'name')
        ordering = ('order',)

    @property
    def unit(self):
        """Return unit of the rule."""
        unit = ''
        if self.indicator.unit:
            unit = f'{self.indicator.unit}'
        return unit
