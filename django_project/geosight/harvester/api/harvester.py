"""Return Harvester API."""
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.harvester.models.harvester import Harvester
from geosight.harvester.models.harvester_log import HarvesterLog
from geosight.harvester.serializer.harvester import (
    HarvesterLogSerializer, HarvesterSerializer
)
from geosight.permission.access import delete_permission_resource


class HarvesterListAPI(APIView):
    """Return BasemapLayer harvester."""

    def get(self, request):
        """Return BasemapLayer list."""
        return Response(
            HarvesterSerializer(
                Harvester.permissions.list(request.user),
                many=True, context={'user': request.user}
            ).data
        )


class HarvesterDetailAPI(APIView):
    """API for detail of harvester."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, uuid):
        """Delete an harvester."""
        harvester = get_object_or_404(Harvester, unique_id=uuid)
        delete_permission_resource(harvester, request.user)
        harvester.delete()
        return Response('Deleted')


class HarvesterLogData(APIView):
    """Return HarvesterLog data API."""

    def get(self, request, pk):
        """Return log data."""
        log = get_object_or_404(
            HarvesterLog, pk=pk
        )
        return Response(
            HarvesterLogSerializer(log).data
        )
