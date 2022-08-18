"""Context layer Admin."""
from django.contrib import admin

from geosight.data.models.context_layer import (
    ContextLayerGroup, ContextLayer, ContextLayerField
)


class ContextLayerFieldInline(admin.TabularInline):
    """ContextLayerField inline."""

    model = ContextLayerField
    extra = 0


class ContextLayerAdmin(admin.ModelAdmin):
    """ContextLayer admin."""

    list_display = ('name', 'layer_type', 'group', 'url')
    inlines = (ContextLayerFieldInline,)
    list_filter = ('group',)
    list_editable = ('group',)


class ContextLayerGroupAdmin(admin.ModelAdmin):
    """ContextLayerGroup admin."""

    list_display = ('name',)


admin.site.register(ContextLayerGroup, ContextLayerGroupAdmin)
admin.site.register(ContextLayer, ContextLayerAdmin)
