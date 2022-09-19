"""Serializer for Permission."""

from geosight.permission.models.factory import PERMISSIONS


class PermissionSerializer:
    """Serializer for Permission."""

    def __init__(self, obj):
        """Serialize permission of object."""
        self.obj = obj

    @property
    def data(self):
        """Serialize the data."""
        obj = self.obj
        try:
            creator = obj.obj.creator
        except AttributeError:
            try:
                creator = obj.creator
            except AttributeError:
                creator = None

        user_permissions = []
        if creator:
            user_permissions.append(
                {
                    'id': creator.id,
                    'username': creator.username,
                    'full_name': creator.get_full_name(),
                    'email': creator.email,
                    'role': creator.profile.role,
                    'permission': PERMISSIONS.OWNER.name,
                    'creator': True
                }
            )
        user_permissions += [
            {
                'id': user_permission.user.id,
                'username': user_permission.user.username,
                'full_name': user_permission.user.get_full_name(),
                'email': user_permission.user.email,
                'role': user_permission.user.profile.role,
                'permission': user_permission.permission
            } for user_permission in obj.user_permissions.exclude(
                user=creator
            )
        ]
        group_permissions = [
            {
                'id': group_permission.group.id,
                'name': group_permission.group.name,
                'permission': group_permission.permission
            } for group_permission in obj.group_permissions.all()
        ]

        org_perm_choices = obj.get_organization_permission_display.keywords[
            'field'].choices
        public_perm_choices = obj.get_public_permission_display.keywords[
            'field'].choices
        user_perm_choices = obj.user_permissions.model.permission.field.choices
        grp_perm_choices = obj.group_permissions.model.permission.field.choices

        return {
            'organization_permission': obj.organization_permission,
            'public_permission': obj.public_permission,
            'user_permissions': user_permissions,
            'group_permissions': group_permissions,
            'choices': {
                'organization_permission': org_perm_choices,
                'public_permission': public_perm_choices,
                'user_permission': user_perm_choices,
                'group_permission': grp_perm_choices,
            },

        }
