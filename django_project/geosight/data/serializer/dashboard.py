"""Serializer for dashboard."""
import json

from django.shortcuts import reverse
from rest_framework import serializers

from geosight.data.models.dashboard import Dashboard, Widget
from geosight.data.serializer.basemap_layer import BasemapLayerSerializer
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.data.serializer.dashboard_relation import (
    DashboardIndicatorSerializer, DashboardBasemapSerializer,
    DashboardContextLayerSerializer, DashboardIndicatorLayerSerializer
)
from geosight.data.serializer.indicator import IndicatorSerializer
from geosight.permission.models.resource.dashboard import DashboardPermission
from geosight.permission.serializer import PermissionSerializer


class WidgetSerializer(serializers.ModelSerializer):
    """Serializer for Widget."""

    layer_id = serializers.SerializerMethodField()

    def get_layer_id(self, obj: Widget):
        """Return layer id of Widget."""
        return obj.layer_id

    class Meta:  # noqa: D106
        model = Widget
        exclude = ('indicator', 'context_layer', 'dashboard')


class DashboardSerializer(serializers.ModelSerializer):
    """Serializer for Dashboard."""

    description = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    widgets = serializers.SerializerMethodField()
    extent = serializers.SerializerMethodField()
    referenceLayer = serializers.SerializerMethodField()
    indicators = serializers.SerializerMethodField()
    indicatorLayers = serializers.SerializerMethodField()
    basemapsLayers = serializers.SerializerMethodField()
    contextLayers = serializers.SerializerMethodField()
    filters = serializers.SerializerMethodField()
    filtersAllowModify = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()
    user_permission = serializers.SerializerMethodField()

    def get_description(self, obj: Dashboard):
        """Return description."""
        return obj.description if obj.description else ''

    def get_referenceLayer(self, obj: Dashboard):
        """Return reference_layer."""
        reference_layer = obj.reference_layer
        if reference_layer:
            return {
                'identifier': reference_layer.identifier,
                'detail_url': reference_layer.detail_url
            }
        else:
            return {
                'identifier': '',
                'detail_url': ''
            }

    def get_indicators(self, obj: Dashboard):
        """Return indicators."""
        output = []
        for model in obj.dashboardindicator_set.all():
            data = IndicatorSerializer(
                model.object, context={'user': self.context.get('user', None)}
            ).data
            data['url'] = reverse(
                'dashboard-indicator-values-api',
                args=[obj.slug, model.object.id]
            )
            dashboard_data = DashboardIndicatorSerializer(
                model, context={'user': self.context.get('user', None)}
            ).data
            if dashboard_data['rules']:
                del data['rules']
            else:
                del dashboard_data['rules']
            data.update(dashboard_data)
            output.append(data)

        return output

    def get_indicatorLayers(self, obj: Dashboard):
        """Return indicatorLayers."""
        dashboard_indicator_layers = []
        for indicator_layer in obj.dashboardindicatorlayer_set.all():
            dashboard_indicator_layers.append(indicator_layer)
        return DashboardIndicatorLayerSerializer(
            dashboard_indicator_layers, many=True,
            context={'user': self.context.get('user', None)}
        ).data

    def get_basemapsLayers(self, obj: Dashboard):
        """Return basemapsLayers."""
        output = []
        for model in obj.dashboardbasemap_set.all():
            data = BasemapLayerSerializer(model.object).data
            data.update(
                DashboardBasemapSerializer(
                    model, context={'user': self.context.get('user', None)}
                ).data
            )
            output.append(data)

        return output

    def get_contextLayers(self, obj: Dashboard):
        """Return contextLayers."""
        output = []
        for model in obj.dashboardcontextlayer_set.all():
            data = ContextLayerSerializer(
                model.object, context={'user': self.context.get('user', None)}
            ).data
            dashboard_data = DashboardContextLayerSerializer(
                model, context={'user': self.context.get('user', None)}
            ).data
            if dashboard_data['data_fields']:
                del data['data_fields']
            else:
                del dashboard_data['data_fields']
            if dashboard_data['styles']:
                del data['styles']
            else:
                del dashboard_data['styles']
            if dashboard_data['label_styles']:
                del data['label_styles']
            else:
                del dashboard_data['label_styles']
            data.update(dashboard_data)
            output.append(data)

        return output

    def get_widgets(self, obj: Dashboard):
        """Return widgets."""
        if obj.id:
            return WidgetSerializer(
                obj.widget_set.all(), many=True
            ).data
        else:
            return []

    def get_extent(self, obj: Dashboard):
        """Return extent."""
        return obj.extent.extent if obj.extent else [0, 0, 0, 0]

    def get_filters(self, obj: Dashboard):
        """Return filters."""
        if obj.filters:
            return json.loads(obj.filters)
        else:
            return []

    def get_filtersAllowModify(self, obj: Dashboard):
        """Return Allow Modify."""
        return obj.filters_allow_modify

    def get_category(self, obj: Dashboard):
        """Return dashboard category name."""
        return obj.group.name if obj.group else ''

    def get_group(self, obj: Dashboard):
        """Return dashboard group name."""
        return obj.group.name if obj.group else ''

    def get_permission(self, obj: Dashboard):
        """Return permissions of dashboard."""
        try:
            return PermissionSerializer(obj=obj.permission).data
        except DashboardPermission.DoesNotExist:
            return PermissionSerializer(obj=DashboardPermission()).data

    def get_user_permission(self, obj: Dashboard):
        """Return permissions of dashboard."""
        try:
            return obj.permission.all_permission(
                self.context.get('user', None)
            )
        except DashboardPermission.DoesNotExist:
            return DashboardPermission().all_permission(
                self.context.get('user', None)
            )

    class Meta:  # noqa: D106
        model = Dashboard
        fields = (
            'id', 'icon', 'name', 'description',
            'category', 'group',
            'widgets', 'extent', 'filters', 'filtersAllowModify',
            'referenceLayer', 'indicators', 'indicatorLayers',
            'basemapsLayers', 'contextLayers', 'permission', 'user_permission'
        )


class DashboardBasicSerializer(serializers.ModelSerializer):
    """Serializer for Dashboard."""

    id = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    modified_at = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_id(self, obj: Dashboard):
        """Return dashboard id."""
        return obj.slug

    def get_group(self, obj: Dashboard):
        """Return dashboard group name."""
        return obj.group.name if obj.group else ''

    def get_category(self, obj: Dashboard):
        """Return dashboard category name."""
        return obj.group.name if obj.group else ''

    def get_modified_at(self, obj: Dashboard):
        """Return dashboard last modified."""
        return obj.modified_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_permission(self, obj: Dashboard):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = Dashboard
        fields = (
            'id', 'icon', 'name', 'modified_at',
            'description', 'group', 'category', 'permission'
        )
