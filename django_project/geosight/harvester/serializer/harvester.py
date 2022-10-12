"""Harvester Log Serializer."""
from django.shortcuts import reverse
from rest_framework import serializers

from core.serializer.user import UserSerializer
from geosight.data.models.indicator import Indicator
from geosight.harvester.models.harvester import Harvester, UsingExposedAPI
from geosight.harvester.models.harvester_attribute import (
    HarvesterAttribute, HarvesterMappingValue
)
from geosight.harvester.models.harvester_log import HarvesterLog


class HarvesterSerializer(serializers.ModelSerializer):
    """Harvester Serializer."""

    name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()
    reference_layer = serializers.SerializerMethodField()
    reference_layer_name = serializers.SerializerMethodField()
    indicator = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()
    last_run = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_name(self, obj: Harvester):
        """Return name of html."""
        return str(obj.unique_id)

    def get_type(self, obj: Harvester):
        """Return name of html."""
        return obj.harvester_name

    def get_creator(self, obj: Harvester):
        """Return user of html."""
        return UserSerializer(obj.creator).data

    def get_creator_name(self, obj: Harvester):
        """Return user of html."""
        if obj.creator:
            full_name = f'{obj.creator.first_name} {obj.creator.last_name}'
            return full_name if full_name.strip() else obj.creator.username
        else:
            return ''

    def get_reference_layer(self, obj: Harvester):
        """Return reference_layer."""
        return obj.reference_layer.identifier

    def get_reference_layer_name(self, obj: Harvester):
        """Return reference_layer name."""
        return obj.reference_layer.name

    def get_indicator(self, obj: Harvester):
        """Return indicator."""
        return obj.indicator.__str__() if obj.indicator else ''

    def get_indicator_id(self, obj: Harvester):
        """Return indicator."""
        return obj.indicator.id if obj.indicator else ''

    def get_last_run(self, obj: Harvester):
        """Return indicator."""
        if obj.last_run:
            return obj.last_run.strftime("%Y-%m-%d %H:%M:%S")
        else:
            return ''

    def get_permission(self, obj: Harvester):
        """Return permission."""
        return obj.permission.all_permission(
            self.context.get('user', None)
        )

    class Meta:  # noqa: D106
        model = Harvester
        fields = '__all__'


class HarvesterLogSerializer(serializers.ModelSerializer):
    """Harvester Log Serializer."""

    html_detail = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    api = serializers.SerializerMethodField()
    note = serializers.SerializerMethodField()

    def get_html_detail(self, obj: HarvesterLog):
        """Return detail in html."""
        return obj.html_detail()

    def get_start_time(self, obj: HarvesterLog):
        """Return start_time in html."""
        return obj.start_time.strftime("%Y-%m-%d %H:%M:%S")

    def get_api(self, obj: HarvesterLog):
        """Return start_time in html."""
        return reverse('harvester-log-api', args=[obj.id])

    def get_note(self, obj: HarvesterLog):
        """Return note."""
        if obj.note:
            return obj.note.replace('\r\n', '<br>').replace('"', "'")
        else:
            return ''

    class Meta:  # noqa: D106
        model = HarvesterLog
        fields = '__all__'


class HarvesterAttributeSerializer(serializers.ModelSerializer):
    """HarvesterAttribute Serializer."""

    value = serializers.SerializerMethodField()

    def get_value(self, obj: HarvesterAttribute):
        """Return value of harvester."""
        try:
            if obj.name == 'API URL' and obj.harvester.harvester_class == \
                    UsingExposedAPI[0]:
                return reverse(
                    'harvester-upload-values-api',
                    args=[str(obj.harvester.unique_id)]
                )
        except Indicator.DoesNotExist:
            pass
        try:
            return obj.value.replace('"', "'")
        except ValueError:
            return obj.value

    class Meta:  # noqa: D106
        model = HarvesterAttribute
        exclude = ('harvester', 'id')


class HarvesterMappingValueSerializer(serializers.ModelSerializer):
    """HarvesterMappingValue Serializer."""

    class Meta:  # noqa: D106
        model = HarvesterMappingValue
        fields = '__all__'
