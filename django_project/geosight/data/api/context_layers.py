"""Context Layers API."""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.context_layer import ContextLayer
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.permission.access import delete_permission_resource


class ContextLayerListAPI(APIView):
    """Return ContextLayer list."""

    def get(self, request):
        """Return ContextLayer list."""
        return Response(
            ContextLayerSerializer(
                ContextLayer.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )


class ContextLayerDetailAPI(APIView):
    """API for detail of context layer."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk):
        """Delete an basemap."""
        layer = get_object_or_404(ContextLayer, pk=pk)
        delete_permission_resource(layer, request.user)
        layer.delete()
        return Response('Deleted')
