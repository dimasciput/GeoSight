"""Base dashboard View."""
from abc import ABC

from django.http import Http404
from rest_framework import serializers

from frontend.views._base import BaseView
from gap_data.models.indicator import Indicator
from gap_data.models.instance import Instance
from gap_data.serializer.link import LinkSerializer


class IndicatorSerializer(serializers.ModelSerializer):
    """Serializer for Indicator."""

    group = serializers.SerializerMethodField()

    def get_group(self, obj: Indicator):
        """Return group."""
        return obj.group.name

    class Meta:  # noqa: D106
        model = Indicator
        fields = ('id', 'group', 'name',)


class BaseDashboardView(ABC, BaseView):
    """Base dashboard View."""

    instance = None

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)

        # TODO:
        #  This will be linked to dashboard model
        instance = Instance.objects.first()
        if not instance:
            raise Http404('Instance not found')

        # TODO:
        #  This slug should be the dashboard slug
        indicator = instance.user_indicators(
            self.request.user
        ).filter(name__iexact=kwargs.get('slug', '')).first()
        if not indicator:
            raise Http404('Indicator not found')

        context['instance'] = instance
        context['dashboard'] = {
            'id': kwargs.get('slug', '')
        }

        links = instance.links
        if not self.request.user.is_staff:
            links = links.exclude(is_public=False)

        context['links'] = [
            dict(d) for d in LinkSerializer(links, many=True).data
        ]
        return context

    @property
    def content_title(self):
        """Return content title."""
        raise NotImplementedError

    @property
    def page_title(self):
        """Return page title."""
        return 'Dashboard'
