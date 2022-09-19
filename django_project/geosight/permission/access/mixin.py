"""Mixin for allowing data."""

from braces.views import LoginRequiredMixin
from django.core.exceptions import PermissionDenied

from django.utils.translation import gettext_lazy as _
from rest_framework import status


class ResourcePermissionDenied(PermissionDenied):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = _("You don't have permission to access this resource")
    detail = _("You don't have permission to access this resource")
    default_code = 'error'


class RoleContributorRequiredMixin(LoginRequiredMixin):
    """Mixin allowing Contributor."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission(request)

        user = request.user
        if user.is_authenticated and user.profile.is_contributor:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


class RoleCreatorRequiredMixin(LoginRequiredMixin):
    """Mixin allowing Creator."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission(request)

        user = request.user
        if user.is_authenticated and user.profile.is_creator:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


class RoleSuperAdminRequiredMixin(LoginRequiredMixin):
    """Mixin allowing Super Admin."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch the permission."""
        if not request.user.is_authenticated:
            return self.handle_no_permission(request)

        user = request.user
        if user.is_authenticated and user.profile.is_admin:
            return super().dispatch(request, *args, **kwargs)
        raise ResourcePermissionDenied


def read_permission_resource(resource, user):
    """Read permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_read_perm(user):
        raise ResourcePermissionDenied


def edit_permission_resource(resource, user):
    """Edit permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_edit_perm(user):
        raise ResourcePermissionDenied


def share_permission_resource(resource, user):
    """Share permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_share_perm(user):
        raise ResourcePermissionDenied


def delete_permission_resource(resource, user):
    """Delete permission resource."""
    if not user.is_authenticated:
        user = None
    if not resource.permission.has_delete_perm(user):
        raise ResourcePermissionDenied
