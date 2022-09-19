"""API for detail of indicator permission."""

import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.indicator import Indicator
from geosight.permission.access import share_permission_resource
from geosight.permission.serializer import PermissionSerializer


class IndicatorPermissionAPI(APIView):
    """API for list of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Return permission data of indicator."""
        obj = get_object_or_404(Indicator, pk=pk)
        share_permission_resource(obj, request.user)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, pk):
        """Return permission data of indicator."""
        obj = get_object_or_404(Indicator, pk=pk)
        share_permission_resource(obj, request.user)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
