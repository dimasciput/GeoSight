"""Basemap layer admin."""
from django.contrib import admin

from geosight.data.models.dashboard import (
    Dashboard, Widget,
    DashboardBasemap, DashboardIndicator, DashboardContextLayer,
    DashboardIndicatorRule
)


class WidgetInline(admin.StackedInline):
    """Widget inline."""

    model = Widget
    extra = 0


class DashboardBasemapInline(admin.TabularInline):
    """DashboardBasemap inline."""

    model = DashboardBasemap
    extra = 0


class DashboardIndicatorInline(admin.TabularInline):
    """DashboardIndicator inline."""

    model = DashboardIndicator
    extra = 0


class DashboardContextLayerInline(admin.TabularInline):
    """DashboardContextLayer inline."""

    model = DashboardContextLayer
    extra = 0


class DashboardAdmin(admin.ModelAdmin):
    """Dashboard admin."""

    list_display = ('slug', 'name', 'creator')
    inlines = (
        DashboardBasemapInline, DashboardIndicatorInline,
        DashboardContextLayerInline, WidgetInline
    )
    prepopulated_fields = {'slug': ('name',)}


class DashboardIndicatorRuleAdmin(admin.ModelAdmin):
    """DashboardIndicatorRule admin."""

    list_display = ('dashboard', 'indicator', 'name', 'rule', 'active')
    list_filter = ('object__dashboard', 'object__object')

    def dashboard(self, obj: DashboardIndicatorRule):
        """Return dashboard name."""
        return obj.object.dashboard.__str__()

    def indicator(self, obj: DashboardIndicatorRule):
        """Return indicator name."""
        return obj.indicator.__str__()


admin.site.register(Dashboard, DashboardAdmin)
admin.site.register(DashboardIndicatorRule, DashboardIndicatorRuleAdmin)
