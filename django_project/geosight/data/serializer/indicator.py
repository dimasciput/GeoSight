"""Indicator Serializer."""
from django.shortcuts import reverse
from rest_framework import serializers

from geosight.data.models.indicator import (
    Indicator, IndicatorRule, IndicatorValue
)
from geosight.harvester.models import Harvester


class IndicatorSerializer(serializers.ModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    rules = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return url."""
        return reverse(
            'indicator-values-api',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return group."""
        return obj.group.name if obj.group else ''

    def get_rules(self, obj: Indicator):
        """Return rules."""
        return IndicatorRuleSerializer(
            obj.indicatorrule_set.all(), many=True
        ).data

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'source', 'description', 'url',
            'reporting_level', 'rules')


class BasicIndicatorSerializer(serializers.ModelSerializer):
    """Serializer for Indicator."""

    url = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    harvester_url = serializers.SerializerMethodField()
    has_harvester = serializers.SerializerMethodField()

    def get_url(self, obj: Indicator):
        """Return url."""
        return reverse(
            'indicator-values-api',
            args=[obj.id]
        )

    def get_category(self, obj: Indicator):
        """Return group."""
        return obj.group.name if obj.group else ''

    def get_harvester_url(self, obj: Indicator):
        """Return harvester_url."""
        try:
            if obj.harvester:
                return reverse(
                    'harvester-indicator-detail', args=[
                        obj.id
                    ]
                )
        except Harvester.DoesNotExist:
            return obj.create_harvester_url

    def get_has_harvester(self, obj: Indicator):
        """Return harvester_url."""
        try:
            if obj.harvester:
                return True
        except Harvester.DoesNotExist:
            pass
        return False

    class Meta:  # noqa: D106
        model = Indicator
        fields = (
            'id', 'name', 'category', 'source', 'description', 'url',
            'reporting_level', 'harvester_url', 'has_harvester')


class IndicatorRuleSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorRule."""

    class Meta:  # noqa: D106
        model = IndicatorRule
        fields = '__all__'


class IndicatorValueSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    class Meta:  # noqa: D106
        model = IndicatorValue
        fields = '__all__'


class IndicatorValueBasicSerializer(serializers.ModelSerializer):
    """Serializer for IndicatorValue."""

    class Meta:  # noqa: D106
        model = IndicatorValue
        exclude = ('id', 'indicator', 'geom_identifier')
