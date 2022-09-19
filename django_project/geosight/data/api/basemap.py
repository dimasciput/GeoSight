"""Basemap API."""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from geosight.permission.access import delete_permission_resource


class BasemapListAPI(APIView):
    """Return BasemapLayer list."""

    def get(self, request):
        """Return BasemapLayer list."""
        return Response(
            BasemapLayerSerializer(
                BasemapLayer.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )


class BasemapDetailAPI(APIView):
    """API for detail of basemap."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk):
        """Delete an basemap."""
        basemap = get_object_or_404(BasemapLayer, pk=pk)
        delete_permission_resource(basemap, request.user)
        basemap.delete()
        return Response('Deleted')
