"""Factory for Indicator."""
import factory

from geosight.data.models.indicator import Indicator
from geosight.data.tests.model_factories.indicator.attributes import (
    IndicatorGroupF
)


class IndicatorF(factory.django.DjangoModelFactory):
    """Factory for Indicator."""

    group = factory.SubFactory(IndicatorGroupF)
    name = factory.Sequence(lambda n: 'Indicator {}'.format(n))

    class Meta:  # noqa: D106
        model = Indicator
