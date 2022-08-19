"""Serializer for dashboard."""

import json

from rest_framework import serializers

from geosight.data.models.dashboard import (
    DashboardIndicator, DashboardBasemap, DashboardContextLayer,
    DashboardIndicatorRule, DashboardContextLayerField
)


class DashboardIndicatorSerializer(serializers.ModelSerializer):
    """Serializer for DashboardIndicator."""

    group = serializers.SerializerMethodField()
    rules = serializers.SerializerMethodField()

    def get_group(self, obj: DashboardIndicator):
        """Return dashboard group name."""
        return obj.group if obj.group else ''

    def get_rules(self, obj: DashboardIndicator):
        """Return rules."""
        return DashboardIndicatorRuleSerializer(
            obj.dashboardindicatorrule_set.all(), many=True
        ).data

    class Meta:  # noqa: D106
        model = DashboardIndicator
        fields = ('order', 'group', 'visible_by_default', 'rules')


class DashboardIndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    indicator = serializers.SerializerMethodField()

    def get_indicator(self, obj: DashboardIndicatorRule):
        """Return dashboard group name."""
        return obj.object.object.__str__()

    class Meta:  # noqa: D106
        model = DashboardIndicatorRule
        fields = '__all__'


class DashboardBasemapSerializer(serializers.ModelSerializer):
    """Serializer for DashboardBasemap."""

    group = serializers.SerializerMethodField()

    def get_group(self, obj: DashboardBasemap):
        """Return dashboard group name."""
        return obj.group if obj.group else ''

    class Meta:  # noqa: D106
        model = DashboardBasemap
        fields = ('order', 'group', 'visible_by_default')


class DashboardContextLayerSerializer(serializers.ModelSerializer):
    """Serializer for DashboardContextLayer."""

    group = serializers.SerializerMethodField()
    data_fields = serializers.SerializerMethodField()
    styles = serializers.SerializerMethodField()
    label_styles = serializers.SerializerMethodField()

    def get_group(self, obj: DashboardContextLayer):
        """Return dashboard group name."""
        return obj.group if obj.group else ''

    def get_data_fields(self, obj: DashboardContextLayer):
        """Return dashboard group name."""
        return DashboardContextLayerFieldSerializer(
            obj.dashboardcontextlayerfield_set, many=True).data

    def get_styles(self, obj: DashboardContextLayer):
        """Return dashboard group name."""
        return json.loads(obj.styles) if obj.styles else None

    def get_label_styles(self, obj: DashboardContextLayer):
        """Return dashboard group name."""
        return json.loads(obj.label_styles) if obj.label_styles else None

    class Meta:  # noqa: D106
        model = DashboardContextLayer
        fields = ('order', 'group', 'visible_by_default',
                  'data_fields', 'styles', 'label_styles')


class DashboardContextLayerFieldSerializer(serializers.ModelSerializer):
    """Serializer for ContextLayerField."""

    class Meta:  # noqa: D106
        model = DashboardContextLayerField
        fields = '__all__'
