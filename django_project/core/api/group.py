"""Group API."""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.group import GeosightGroup
from core.permissions import AdminAuthenticationPermission
from core.serializer.group import GroupSerializer
from core.serializer.user import UserSerializer


class GroupListAPI(APIView):
    """Return Group list."""

    def get(self, request):
        """Return Group list."""
        return Response(
            GroupSerializer(GeosightGroup.objects.all(), many=True).data
        )


class GroupDetailAPI(APIView):
    """API for detail of group."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def get(self, request, pk):
        """Delete an user."""
        group = get_object_or_404(GeosightGroup, pk=pk)
        return Response({
            'users': UserSerializer(group.user_set.all(), many=True).data
        })

    def delete(self, request, pk):
        """Delete an user."""
        group = get_object_or_404(GeosightGroup, pk=pk)
        group.delete()
        return Response('Deleted')
