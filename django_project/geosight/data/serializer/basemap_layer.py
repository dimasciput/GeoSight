"""Serializer for Basemap Layer."""

from rest_framework import serializers

from geosight.data.models.basemap_layer import (
    BasemapLayerParameter, BasemapLayer
)


class BasemapLayerSerializer(serializers.ModelSerializer):
    """Serializer for BasemapLayer."""

    category = serializers.SerializerMethodField()
    parameters = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_category(self, obj: BasemapLayer):
        """Return group."""
        return obj.group.name if obj.group else ''

    def get_parameters(self, obj: BasemapLayer):
        """Return parameters."""
        urls = obj.url.split('?')
        parameters = {}

        for parameter in obj.basemaplayerparameter_set.all():
            value = parameter.value
            try:
                value = float(value)
            except ValueError:
                pass
            parameters[parameter.name] = value

        if len(urls) > 1:
            for param in urls[1].split('&'):
                params = param.split('=')
                if params[0].lower() != 'bbox':
                    parameters[params[0]] = '='.join(params[1:])
        return parameters

    def get_permission(self, obj: BasemapLayer):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = BasemapLayer
        exclude = ('group',)


class BasemapLayerParameterSerializer(serializers.ModelSerializer):
    """Serializer for BasemapLayerParameter."""

    class Meta:  # noqa: D106
        model = BasemapLayerParameter
        fields = '__all__'
