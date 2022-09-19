"""Serializer for Basemap Layer."""

from rest_framework import serializers

from geosight.georepo.models.reference_layer import ReferenceLayer


class ReferenceLayerSerializer(serializers.ModelSerializer):
    """Serializer for ReferenceLayer."""

    class Meta:  # noqa: D106
        model = ReferenceLayer
        fields = ('id', 'identifier', 'name',)
