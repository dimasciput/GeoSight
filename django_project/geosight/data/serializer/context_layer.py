"""Context Layer serializer."""
import json
import urllib.parse

from rest_framework import serializers

from geosight.data.models.context_layer import (
    ContextLayer, ContextLayerField
)


class ContextLayerSerializer(serializers.ModelSerializer):
    """Serializer for ContextLayer."""

    url = serializers.SerializerMethodField()
    parameters = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    data_fields = serializers.SerializerMethodField()

    def get_url(self, obj: ContextLayer):
        """Url."""
        return urllib.parse.unquote(obj.url.split('?')[0])

    def get_parameters(self, obj: ContextLayer):
        """Return parameters."""
        urls = obj.url.split('?')
        parameters = {}
        if len(urls) > 1:
            for param in urls[1].split('&'):
                params = param.split('=')
                if params[0].lower() != 'bbox':
                    parameters[params[0]] = '='.join(params[1:])
        return parameters

    def get_category(self, obj: ContextLayer):
        """Return category name."""
        return obj.group.name if obj.group else ''

    def get_data_fields(self, obj: ContextLayer):
        """Return category name."""
        return ContextLayerFieldSerializer(
            obj.contextlayerfield_set.all(), many=True
        ).data

    def get_styles(self, obj: ContextLayer):
        """Return category name."""
        return json.loads(obj.styles) if obj.styles else None

    class Meta:  # noqa: D106
        model = ContextLayer
        exclude = ('group',)


class ContextLayerFieldSerializer(serializers.ModelSerializer):
    """Serializer for ContextLayerField."""

    class Meta:  # noqa: D106
        model = ContextLayerField
        fields = '__all__'
