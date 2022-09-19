"""User API."""

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from core.serializer.user import UserSerializer

User = get_user_model()


class UserListAPI(APIView):
    """Return User list."""

    def get(self, request):
        """Return User list."""
        return Response(UserSerializer(User.objects.all(), many=True).data)


class UserDetailAPI(APIView):
    """API for detail of user."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def delete(self, request, pk):
        """Delete an user."""
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response('Deleted')
