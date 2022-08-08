"""Return Harvester API."""
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.harvester.models.harvester import Harvester
from geosight.harvester.models.harvester_log import HarvesterLog
from geosight.harvester.serializer.harvester import (
    HarvesterLogSerializer, HarvesterSerializer
)


class HarvesterListAPI(APIView):
    """Return BasemapLayer harvester."""

    def get(self, request):
        """Return BasemapLayer list."""
        return Response(
            HarvesterSerializer(Harvester.objects.all(), many=True).data
        )


class HarvesterDetailAPI(APIView):
    """API for detail of harvester."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def delete(self, request, uuid):
        """Delete an harvester."""
        harvester = get_object_or_404(Harvester, unique_id=uuid)
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
