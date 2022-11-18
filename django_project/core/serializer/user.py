"""User serializer."""
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """User serializer."""

    is_staff = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    is_contributor = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    def get_is_staff(self, obj: User):
        """Return is staff."""
        return 'true' if obj.is_staff else 'false'

    def get_name(self, obj: User):
        """Return is staff."""
        return obj.get_full_name() if obj.get_full_name() else obj.username

    def get_full_name(self, obj: User):
        """Return full name."""
        return obj.get_full_name()

    def get_role(self, obj: User):
        """Return role."""
        return obj.profile.role

    def get_is_contributor(self, obj: User):
        """Return is contributor."""
        return 'true' if obj.profile.is_contributor else 'false'

    def get_is_creator(self, obj: User):
        """Return is creator."""
        return 'true' if obj.profile.is_creator else 'false'

    def get_is_admin(self, obj: User):
        """Return is admin."""
        return 'true' if obj.profile.is_admin else 'false'

    class Meta:  # noqa: D106
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'name', 'email', 'role',
            'is_contributor', 'is_creator', 'is_admin', 'full_name'
        )
