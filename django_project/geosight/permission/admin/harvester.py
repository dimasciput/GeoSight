"""Permission admin."""

from django.contrib import admin

from geosight.permission.models import (
    HarvesterPermission, HarvesterUserPermission, HarvesterGroupPermission
)


class UserPermissionInline(admin.TabularInline):
    """UserPermission inline."""

    model = HarvesterUserPermission
    extra = 0


class HarvesterPermissionInline(admin.TabularInline):
    """HarvesterPermission inline."""

    model = HarvesterGroupPermission
    extra = 0


class PermissionAdmin(admin.ModelAdmin):
    """Permission admin."""

    list_display = ('obj', 'organization_permission', 'public_permission')
    inlines = (UserPermissionInline, HarvesterPermissionInline)
    read_only = ('obj',)


admin.site.register(HarvesterPermission, PermissionAdmin)
