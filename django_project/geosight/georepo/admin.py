"""Georepo admin."""

from django.contrib import admin

from geosight.georepo.models import ReferenceLayer

admin.site.register(ReferenceLayer, admin.ModelAdmin)
