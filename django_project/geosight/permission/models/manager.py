"""Contains model manager for using permission."""

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class PermissionException(Exception):
    """Exception raised error of permission."""

    def __init__(self, message="Don't have access to do the action."):
        """Init class."""
        self.message = message
        super().__init__(self.message)


class PermissionManager(models.Manager):
    """Manager for resource that has permission.

    Make sure the Model override AbstractEditData
    """

    def save_creator(self, obj, user):
        """Save creator of object."""
        try:
            obj.creator = user
            obj.save()
        except AttributeError:
            try:
                obj.permission.creator = user
                obj.permission.save()
            except AttributeError:
                pass

    def get_or_create(
            self, user: User, defaults=None, have_creator=True, **kwargs):
        """Get or create function with user."""
        if have_creator:
            try:
                if not user.profile.is_creator:
                    raise PermissionException()
            except AttributeError:
                raise PermissionException()

        obj, created = super().get_or_create(defaults=defaults, **kwargs)
        if created:
            self.save_creator(obj, user)
        return obj, created

    def create(self, user: User, **kwargs):
        """Create function with user."""
        try:
            if not user.profile.is_creator:
                raise PermissionException()
        except AttributeError:
            raise PermissionException()

        obj = super().create(**kwargs)
        if not obj.creator:
            self.save_creator(obj, user)
        return obj

    def list(self, user: User):
        """Get list of user."""
        if user:
            try:
                if user.profile.is_admin:
                    return self.all()
            except AttributeError:
                user = None

            obj_ids = []
            for obj in self.all():
                try:
                    if obj.permission.has_list_perm(user):
                        obj_ids.append(obj.id)
                except Exception:
                    pass
            return self.filter(id__in=obj_ids)
        else:
            return self.none()
