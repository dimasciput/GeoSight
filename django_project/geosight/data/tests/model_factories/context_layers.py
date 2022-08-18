"""Factory for ContextLayer."""
import factory

from geosight.data.models.context_layer import ContextLayer


class ContextLayerF(factory.django.DjangoModelFactory):
    """Factory for ContextLayer."""

    name = factory.Sequence(lambda n: 'Context Layer {}'.format(n))

    class Meta:  # noqa: D106
        model = ContextLayer
