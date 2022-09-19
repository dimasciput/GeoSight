"""Permission admin."""

from django.contrib import admin

from geosight.permission.models import (
    ReferenceLayerIndicatorPermission,
    ReferenceLayerIndicatorUserPermission,
    ReferenceLayerIndicatorGroupPermission
)


class UserPermissionInline(admin.TabularInline):
    """UserPermission inline."""

    model = ReferenceLayerIndicatorUserPermission
    extra = 0


class GroupPermissionInline(admin.TabularInline):
    """GroupPermission inline."""

    model = ReferenceLayerIndicatorGroupPermission
    extra = 0


class PermissionAdmin(admin.ModelAdmin):
    """Permission admin."""

    list_display = ('obj', 'organization_permission', 'public_permission')
    inlines = (UserPermissionInline, GroupPermissionInline)
    read_only = ('obj',)


admin.site.register(ReferenceLayerIndicatorPermission, PermissionAdmin)
