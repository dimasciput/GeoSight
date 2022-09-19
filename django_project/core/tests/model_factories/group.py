"""Factory for User."""
import factory
from django.contrib.auth.models import Group


class GroupF(factory.django.DjangoModelFactory):
    """Factory for Group."""

    class Meta:  # noqa: D106
        model = Group
