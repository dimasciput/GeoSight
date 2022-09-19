"""Basemap layer admin."""
from django.contrib import admin

from geosight.data.models.basemap_layer import (
    BasemapLayer, BasemapLayerParameter
)


class BasemapLayerParameterInline(admin.TabularInline):
    """BasemapLayerParameter inline."""

    model = BasemapLayerParameter
    extra = 0


class BasemapLayerAdmin(admin.ModelAdmin):
    """BasemapLayer admin."""

    list_display = ('name', 'url', 'group', 'creator')
    inlines = (BasemapLayerParameterInline,)
    list_editable = ('group', 'creator')


admin.site.register(BasemapLayer, BasemapLayerAdmin)
