"""Group serializer."""
from django.contrib.auth.models import Group
from rest_framework import serializers


class GroupSerializer(serializers.ModelSerializer):
    """Group serializer."""

    class Meta:  # noqa: D106
        model = Group
        fields = ('id', 'name')
