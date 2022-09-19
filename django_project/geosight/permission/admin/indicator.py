"""Permission admin."""

from django.contrib import admin

from geosight.permission.models import (
    IndicatorPermission, IndicatorUserPermission, IndicatorGroupPermission
)


class UserPermissionInline(admin.TabularInline):
    """UserPermission inline."""

    model = IndicatorUserPermission
    extra = 0


class IndicatorPermissionInline(admin.TabularInline):
    """IndicatorPermission inline."""

    model = IndicatorGroupPermission
    extra = 0


class PermissionAdmin(admin.ModelAdmin):
    """Permission admin."""

    list_display = ('obj', 'organization_permission', 'public_permission')
    inlines = (UserPermissionInline, IndicatorPermissionInline)
    read_only = ('obj',)


admin.site.register(IndicatorPermission, PermissionAdmin)
