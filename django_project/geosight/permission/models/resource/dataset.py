"""ReferenceLayerIndicator permission."""

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from geosight.permission.models.default import PermissionDefault
from geosight.permission.models.factory import (
    permission_model_factory,
    user_permission_model_factory,
    group_permission_model_factory,
)
from geosight.permission.models.manager import PermissionManager

default_permission = PermissionDefault.DATASET

Permission = permission_model_factory(
    object_model=ReferenceLayerIndicator,
    organization_permissions=default_permission.organization.permissions,
    organization_permission_default=default_permission.organization.default,
    public_permissions=default_permission.public.permissions,
    public_permission_default=default_permission.public.default,
    role_to_edit_level_input=2  # ROLES.CONTRIBUTOR
)


class ReferenceLayerIndicatorPermission(Permission):
    """Resource Permission."""

    objects = models.Manager()
    permissions = PermissionManager()


UserPermission = user_permission_model_factory(
    object_model=ReferenceLayerIndicatorPermission,
    permission_default=default_permission.user.default,
    permissions=default_permission.user.permissions,
)
GroupPermission = group_permission_model_factory(
    object_model=ReferenceLayerIndicatorPermission,
    permission_default=default_permission.group.default,
    permissions=default_permission.group.permissions,
)


class ReferenceLayerIndicatorUserPermission(UserPermission):
    """UserPermission."""

    pass


class ReferenceLayerIndicatorGroupPermission(GroupPermission):
    """GroupPermission."""

    pass


@receiver(post_save, sender=ReferenceLayerIndicator)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        ReferenceLayerIndicatorPermission.objects.create(obj=instance)


@receiver(post_save, sender=ReferenceLayerIndicator)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
