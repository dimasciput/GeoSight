"""Reference Layer API."""

from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.georepo.models.reference_layer import ReferenceLayer
from geosight.georepo.serializer.reference_layer import (
    ReferenceLayerSerializer
)


class ReferenceLayerListAPI(APIView):
    """Return ReferenceLayer list."""

    def get(self, request):
        """Return BasemapLayer list."""
        return Response(
            ReferenceLayerSerializer(
                ReferenceLayer.objects.all().order_by('name'), many=True
            ).data
        )
