"""Group form."""
from django import forms
from django.contrib.auth.models import Group
from django.forms.models import model_to_dict

from core.models.group import GeosightGroup


class GroupForm(forms.ModelForm):
    """Group form."""

    class Meta:  # noqa: D106
        model = GeosightGroup
        fields = ('name',)

    @staticmethod
    def model_to_initial(model: GeosightGroup):
        """Return model data as json."""
        initial = model_to_dict(Group.objects.get(id=model.id))
        return initial
