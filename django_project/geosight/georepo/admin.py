"""Georepo admin."""

from django.contrib import admin

from geosight.georepo.models import ReferenceLayer, ReferenceLayerIndicator
from geosight.georepo.request import GeorepoRequest


@admin.action(description='Pull latest reference layer.')
def fetch_new(modeladmin, request, queryset):
    """Fetch new reference layer."""
    georepo_request = GeorepoRequest()
    request = georepo_request.get_reference_layer_list()
    for reference_layer in request.json():
        identifier = reference_layer['identifier']
        name = reference_layer['name']
        ref, created = ReferenceLayer.objects.get_or_create(
            identifier=identifier
        )
        ref.name = name
        ref.save()


class ReferenceLayerAdmin(admin.ModelAdmin):
    """Reference layer admin."""

    list_display = ['identifier', 'name']
    ordering = ['name']
    actions = [fetch_new]


admin.site.register(ReferenceLayer, ReferenceLayerAdmin)
admin.site.register(ReferenceLayerIndicator, admin.ModelAdmin)
