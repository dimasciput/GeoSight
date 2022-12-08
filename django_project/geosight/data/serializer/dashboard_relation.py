"""Serializer for dashboard."""

import json

from rest_framework import serializers

from geosight.data.models.dashboard import (
    DashboardIndicator, DashboardBasemap, DashboardContextLayer,
    DashboardIndicatorRule, DashboardContextLayerField,
    DashboardIndicatorLayer, DashboardIndicatorLayerIndicator
)


class DashboardIndicatorSerializer(serializers.ModelSerializer):
    """Serializer for DashboardIndicator."""

    group = serializers.SerializerMethodField()
    rules = serializers.SerializerMethodField()

    def get_group(self, obj: DashboardIndicator):
        """Return dashboard group name."""
        return obj.object.group.name if obj.object.group else ''

    def get_rules(self, obj: DashboardIndicator):
        """Return rules."""
        return DashboardIndicatorRuleSerializer(
            obj.dashboardindicatorrule_set.all(), many=True
        ).data

    class Meta:  # noqa: D106
        model = DashboardIndicator
        fields = ('order', 'group', 'visible_by_default', 'rules')


class DashboardSerializer(serializers.ModelSerializer):

    group = serializers.SerializerMethodField()
    group_parent = serializers.SerializerMethodField()
    group_order = serializers.SerializerMethodField()

    def get_group(self, obj):
        """Return dashboard group name."""
        return obj.relation_group.name if obj.relation_group else '-'

    def get_group_parent(self, obj):
        """Return name of parent of the group"""
        if obj.relation_group:
            if obj.relation_group.group:
                return obj.relation_group.group.name
        else:
            return '-'

    def get_group_order(self, obj):
        """Return order of the group"""
        return obj.relation_group.order if obj.relation_group else '-'

    class Meta:
        fields = ('group', 'group_parent', 'group_order')


class DashboardIndicatorLayerSerializer(DashboardSerializer):
    """Serializer for DashboardLayer."""

    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    indicators = serializers.SerializerMethodField()
    style = serializers.SerializerMethodField()
    last_update = serializers.SerializerMethodField()
    rules = serializers.SerializerMethodField()
    reporting_level = serializers.SerializerMethodField()
    reporting_levels = serializers.SerializerMethodField()

    def get_name(self, obj: DashboardIndicatorLayer):
        """Return dashboard group name."""
        return obj.label

    def get_description(self, obj: DashboardIndicatorLayer):
        """Return dashboard group name."""
        return obj.desc

    def get_indicators(self, obj: DashboardIndicatorLayer):
        """Return rules."""
        return DashboardIndicatorLayerIndicatorSerializer(
            obj.dashboardindicatorlayerindicator_set.all(), many=True
        ).data

    def get_style(self, obj: DashboardIndicatorLayer):
        """Return style."""
        return json.loads(obj.style) if obj.style else None

    def get_last_update(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        return obj.last_update

    def get_rules(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        indicators = obj.dashboardindicatorlayerindicator_set.all()
        if indicators.count() >= 2:
            return DashboardIndicatorLayerIndicatorSerializer(
                obj.dashboardindicatorlayerindicator_set, many=True
            ).data
        else:
            return []

    def get_reporting_level(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        indicators = obj.dashboardindicatorlayerindicator_set.all()
        for indicator in indicators:
            return indicator.indicator.reporting_level
        return None

    def get_reporting_levels(self, obj: DashboardIndicatorLayer):
        """Return last update."""
        indicators = obj.dashboardindicatorlayerindicator_set.all()
        levels = []
        for indicator in indicators:
            levels += indicator.indicator.reporting_levels
        return levels

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayer
        fields = (
            'id', 'name', 'description', 'style',
            'order', 'visible_by_default', 'indicators',
            'last_update', 'rules', 'reporting_level', 'reporting_levels')
        fields += DashboardSerializer.Meta.fields


class DashboardIndicatorLayerIndicatorSerializer(serializers.ModelSerializer):
    """Serializer for DashboardLayer."""

    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    indicator = serializers.SerializerMethodField()
    rule = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()
    shortcode = serializers.SerializerMethodField()

    def get_id(self, obj: DashboardIndicatorLayerIndicator):
        """Return dashboard group name."""
        return obj.indicator.id

    def get_name(self, obj: DashboardIndicatorLayerIndicator):
        """Return dashboard group name."""
        return obj.name if obj.name else obj.indicator.name

    def get_indicator(self, obj: DashboardIndicatorLayerIndicator):
        """Return dashboard group name."""
        return obj.indicator.__str__()

    def get_shortcode(self, obj: DashboardIndicatorLayerIndicator):
        """Return indicator shortcode."""
        return obj.indicator.shortcode

    def get_rule(self, obj: DashboardIndicatorLayerIndicator):
        """Return rule."""
        return f'x=={obj.indicator.id}'

    def get_active(self, obj: DashboardIndicatorLayerIndicator):
        """Return the rule is active or not."""
        return True

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerIndicator
        fields = (
            'id', 'indicator', 'rule', 'order',
            'name', 'color', 'active', 'shortcode'
        )


class DashboardIndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    indicator = serializers.SerializerMethodField()

    def get_indicator(self, obj: DashboardIndicatorRule):
        """Return dashboard group name."""
        return obj.object.object.__str__()

    class Meta:  # noqa: D106
        model = DashboardIndicatorRule
        exclude = ('object',)


class DashboardBasemapSerializer(serializers.ModelSerializer):
    """Serializer for DashboardBasemap."""

    group = serializers.SerializerMethodField()

    def get_group(self, obj: DashboardBasemap):
        """Return dashboard group name."""
        return obj.relation_group.name if obj.relation_group else ''

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
        return obj.relation_group.name if obj.relation_group else ''

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
