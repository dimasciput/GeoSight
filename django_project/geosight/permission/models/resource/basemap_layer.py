"""BasemapLayer permission."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.data.models.basemap_layer import BasemapLayer
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)

default_permission = PermissionDefault.BASEMAP

Permission = permission_model_factory(
    object_model=BasemapLayer,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default
)


class BasemapLayerPermission(Permission):
    """Resource Permission."""

    pass


UserPermission = user_permission_model_factory(
    object_model=BasemapLayerPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=BasemapLayerPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class BasemapLayerUserPermission(UserPermission):
    """UserPermission."""

    pass


class BasemapLayerGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=BasemapLayer)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        BasemapLayerPermission.objects.create(obj=instance)


@receiver(post_save, sender=BasemapLayer)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
