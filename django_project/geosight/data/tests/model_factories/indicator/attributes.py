"""Factory for Indicator Attributes."""
import factory

from geosight.data.models.indicator import IndicatorGroup


class IndicatorGroupF(factory.django.DjangoModelFactory):
    """Factory for IndicatorGroup."""

    name = factory.Sequence(lambda n: 'Group {}'.format(n))

    class Meta:  # noqa: D106
        model = IndicatorGroup
