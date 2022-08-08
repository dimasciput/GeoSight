"""Model Factory for Georepo."""
import uuid

import factory

from geosight.georepo.models import ReferenceLayer


class ReferenceLayerF(factory.django.DjangoModelFactory):
    """Model Factory for ReferenceLayer."""

    identifier = factory.Sequence(lambda n: str(uuid.uuid4()))

    class Meta:  # noqa: D106
        model = ReferenceLayer
