"""Serializer for Code."""

from rest_framework import serializers

from geosight.data.models.code import Code, CodeList


class CodeSerializer(serializers.ModelSerializer):
    """Serializer for Code."""

    value = serializers.SerializerMethodField()

    def get_value(self, obj: Code):
        """Return value."""
        return obj.id

    class Meta:  # noqa: D106
        model = Code
        fields = ('id', 'value', 'label', 'code')


class CodeListSerializer(serializers.ModelSerializer):
    """Serializer for Code."""

    codes = serializers.SerializerMethodField()

    def get_codes(self, obj: CodeList):
        """Codes."""
        return obj.codes

    class Meta:  # noqa: D106
        model = CodeList
        fields = '__all__'
