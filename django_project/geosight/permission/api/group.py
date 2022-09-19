"""API for detail of group permission."""

import json

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.group import GeosightGroup
from geosight.permission.serializer import PermissionSerializer


class GroupPermissionAPI(APIView):
    """API for list of group."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """Return permission data of group."""
        obj = get_object_or_404(GeosightGroup, pk=pk)
        return Response(
            PermissionSerializer(obj=obj.permission).data
        )

    def post(self, request, pk):
        """Return permission data of group."""
        obj = get_object_or_404(GeosightGroup, pk=pk)
        data = json.loads(request.data['data'])
        obj.permission.update(data)
        return Response('OK')
