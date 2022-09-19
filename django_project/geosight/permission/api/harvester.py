"""API for detail of harvester permission."""

import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.harvester.models.harvester import Harvester
from geosight.permission.access import share_permission_resource
from geosight.permission.serializer import PermissionSerializer


class HarvesterPermissionAPI(APIView):
    """API for list of harvester."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, uuid):
        """Return permission data of harvester."""
        obj = get_object_or_404(Harvester, unique_id=uuid)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, uuid):
        """Return permission data of harvester."""
        obj = get_object_or_404(Harvester, unique_id=uuid)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
