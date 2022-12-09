"""Basemap layer admin."""
from django.contrib import admin

from geosight.data.models.dashboard import (
    Dashboard, Widget,
    DashboardBasemap, DashboardIndicator, DashboardContextLayer,
    DashboardContextLayerField,
    DashboardIndicatorRule, DashboardBookmark,
    DashboardIndicatorLayer,
    DashboardIndicatorLayerIndicator,
    DashboardRelationGroup
)


class WidgetInline(admin.StackedInline):
    """Widget inline."""

    model = Widget
    extra = 0


class DashboardBasemapInline(admin.TabularInline):
    """DashboardBasemap inline."""

    model = DashboardBasemap
    extra = 0


class DashboardIndicatorRuleInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardIndicatorRule
    extra = 0


class DashboardIndicatorAdmin(admin.ModelAdmin):
    """DashboardIndicatorRule admin."""

    list_display = ('dashboard', 'object', 'visible_by_default')
    list_filter = ('dashboard', 'object')
    inlines = (DashboardIndicatorRuleInline,)


class DashboardIndicatorLayerIndicatorInline(admin.TabularInline):
    """DashboardIndicatorLayerIndicator inline."""

    model = DashboardIndicatorLayerIndicator
    extra = 0


class DashboardIndicatorLayerAdmin(admin.ModelAdmin):
    """DashboardIndicatorLayer admin."""

    list_display = ('dashboard', 'label', 'visible_by_default')
    list_filter = ('dashboard',)
    inlines = (DashboardIndicatorLayerIndicatorInline,)


class DashboardContextLayerInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardContextLayer
    extra = 0


class DashboardAdmin(admin.ModelAdmin):
    """Dashboard admin."""

    list_display = ('slug', 'name', 'creator')
    inlines = (
        DashboardBasemapInline,
        DashboardContextLayerInline, WidgetInline
    )
    prepopulated_fields = {'slug': ('name',)}


class DashboardContextLayerFieldInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardContextLayerField
    extra = 0


class DashboardContextLayerAdmin(admin.ModelAdmin):
    """DashboardIndicatorRule admin."""

    list_display = ('dashboard', 'object', 'visible_by_default')
    list_filter = ('dashboard', 'object')
    inlines = (DashboardContextLayerFieldInline,)


class DashboardBookmarkAdmin(admin.ModelAdmin):
    """DashboardBookmark admin."""

    list_display = ('dashboard', 'name',)
    list_filter = ('dashboard',)
    filter_horizontal = ('selected_context_layers',)


class DashboardRelationGroupAdmin(admin.ModelAdmin):
    list_filter = ('name', 'group')


admin.site.register(Dashboard, DashboardAdmin)
admin.site.register(DashboardContextLayer, DashboardContextLayerAdmin)
admin.site.register(DashboardIndicator, DashboardIndicatorAdmin)
admin.site.register(DashboardIndicatorLayer, DashboardIndicatorLayerAdmin)
admin.site.register(DashboardBookmark, DashboardBookmarkAdmin)
admin.site.register(DashboardRelationGroup, DashboardRelationGroupAdmin)
