"""ContextLayer permission."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.data.models.context_layer import ContextLayer
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)

default_permission = PermissionDefault.CONTEXT_LAYER

Permission = permission_model_factory(
    object_model=ContextLayer,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default
)


class ContextLayerPermission(Permission):
    """Resource Permission."""

    pass


UserPermission = user_permission_model_factory(
    object_model=ContextLayerPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=ContextLayerPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class ContextLayerUserPermission(UserPermission):
    """UserPermission."""

    pass


class ContextLayerGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=ContextLayer)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        ContextLayerPermission.objects.create(obj=instance)


@receiver(post_save, sender=ContextLayer)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
