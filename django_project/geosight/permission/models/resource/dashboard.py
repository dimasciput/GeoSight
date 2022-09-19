"""Dashboard permission."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.data.models.dashboard import Dashboard
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)

default_permission = PermissionDefault.DASHBOARD

Permission = permission_model_factory(
    object_model=Dashboard,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2,  # ROLES.CONTRIBUTOR
    role_to_share_level_input=2  # ROLES.CONTRIBUTOR
)


class DashboardPermission(Permission):
    """Resource Permission."""

    pass


UserPermission = user_permission_model_factory(
    object_model=DashboardPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=DashboardPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class DashboardUserPermission(UserPermission):
    """UserPermission."""

    pass


class DashboardGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=Dashboard)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        DashboardPermission.objects.create(obj=instance)


@receiver(post_save, sender=Dashboard)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
