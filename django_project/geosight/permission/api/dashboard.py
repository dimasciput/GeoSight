"""API for detail of dashboard permission."""

import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.dashboard import Dashboard
from geosight.permission.access import share_permission_resource
from geosight.permission.serializer import PermissionSerializer


class DashboardPermissionAPI(APIView):
    """API for list of dashboard."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, slug):
        """Return permission data of dashboard."""
        obj = get_object_or_404(Dashboard, slug=slug)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, slug):
        """Return permission data of dashboard."""
        obj = get_object_or_404(Dashboard, slug=slug)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
