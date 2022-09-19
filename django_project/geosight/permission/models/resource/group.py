"""Group permission."""

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models.general import AbstractEditData
from core.models.group import GeosightGroup
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)
from geosight.permission.models.manager import PermissionManager

default_permission = PermissionDefault.GROUP

Permission = permission_model_factory(
    object_model=GeosightGroup,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default
)


class GroupModelPermission(Permission, AbstractEditData):
    """Resource Permission."""

    objects = models.Manager()
    permissions = PermissionManager()


UserResourcePermission = user_permission_model_factory(
    object_model=GroupModelPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupResourcePermission = group_permission_model_factory(
    object_model=GroupModelPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class GroupModelUserPermission(UserResourcePermission):
    """UserPermission."""

    pass


class GroupModelGroupPermission(GroupResourcePermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=GeosightGroup)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        GroupModelPermission.objects.create(obj=instance)


@receiver(post_save, sender=GeosightGroup)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
