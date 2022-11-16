"""Profile user model."""

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from geosight.permission.models import PermissionDetail, PERMISSIONS_LENGTH

User = get_user_model()


class ROLES:
    """Roles list."""

    VIEWER = PermissionDetail('Viewer', 1)
    CONTRIBUTOR = PermissionDetail('Contributor', 2)
    CREATOR = PermissionDetail('Creator', 3)
    SUPER_ADMIN = PermissionDetail('Super Admin', 4)

    def get_level(self, name: str):
        """Return level by name."""
        try:
            return getattr(self, name.upper().replace(' ', '_')).level
        except AttributeError:
            return -1

    def get_user_level(self, user: User):
        """Return level by user role."""
        try:
            return self.get_level(user.profile.role)
        except AttributeError:
            return self.get_level(self.VIEWER)


ROLE_DEFAULT = ROLES.VIEWER.name

ROLES_TYPES = [
    (ROLES.VIEWER.name, ROLES.VIEWER.name),
    (ROLES.CONTRIBUTOR.name, ROLES.CONTRIBUTOR.name),
    (ROLES.CREATOR.name, ROLES.CREATOR.name),
    (ROLES.SUPER_ADMIN.name, ROLES.SUPER_ADMIN.name),
]


class Profile(models.Model):
    """Extension of User."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=PERMISSIONS_LENGTH,
        choices=ROLES_TYPES,
        default=ROLE_DEFAULT
    )

    def __str__(self):
        """Str name of profile."""
        return self.role

    @staticmethod
    def update_role(user: User, role: str):
        """When user role."""
        profile, created = Profile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()

    @property
    def is_admin(self):
        """Return if user is admin or not."""
        return self.role == ROLES.SUPER_ADMIN.name or self.user.is_superuser \
               or self.user.is_staff  # noqa: E127

    @property
    def is_creator(self):
        """Return if user is creator or not."""
        return self.role in [
            ROLES.SUPER_ADMIN.name, ROLES.CREATOR.name
        ] or self.user.is_superuser or self.user.is_staff

    @property
    def is_contributor(self):
        """Return if user is contributor or not."""
        return self.role in [
            ROLES.SUPER_ADMIN.name, ROLES.CREATOR.name, ROLES.CONTRIBUTOR.name
        ] or self.user.is_superuser or self.user.is_staff


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """When user created."""
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """When user saved."""
    instance.profile.save()


@receiver(pre_save, sender=Profile)
def post_profile_saved(sender, instance, **kwargs):
    """When profile saved, check if it's already profile on it.

    If yes, user that profile.
    """
    if not instance.id:
        try:
            profile = Profile.objects.get(user=instance.user)
            instance.id = profile.id
            instance.pk = profile.pk
        except Profile.DoesNotExist:
            pass
