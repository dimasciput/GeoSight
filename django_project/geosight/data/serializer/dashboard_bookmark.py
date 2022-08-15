"""Serializer for dashboard bookmark."""

import json

from rest_framework import serializers

from geosight.data.models.dashboard import DashboardBookmark


class DashboardBookmarkSerializer(serializers.ModelSerializer):
    """Serializer for dashboard bookmark."""

    filters = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()
    extent = serializers.SerializerMethodField()

    def get_filters(self, obj: DashboardBookmark):
        """Return filters."""
        if obj.filters:
            return json.loads(obj.filters)
        else:
            return []

    def get_creator(self, obj: DashboardBookmark):
        """Return creator."""
        return obj.creator.username if obj.creator else ''

    def get_extent(self, obj: DashboardBookmark):
        """Return extent."""
        return obj.extent.extent if obj.extent else [0, 0, 0, 0]

    class Meta:  # noqa: D106
        model = DashboardBookmark
        fields = '__all__'
