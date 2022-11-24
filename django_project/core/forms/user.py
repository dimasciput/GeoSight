"""User form."""
from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError
from django.forms.models import model_to_dict
from django.utils.translation import gettext_lazy as _

from core.models.profile import ROLES_TYPES, ROLES

User = get_user_model()


class UserForm(forms.ModelForm):
    """User form."""

    username_validator = UnicodeUsernameValidator()
    username = forms.CharField(
        help_text=_(
            'Required. 150 characters or fewer. '
            'Letters, digits and @/./+/-/_ only.'
        ),
        validators=[username_validator],
    )
    role = forms.ChoiceField(
        label='Role',
        choices=ROLES_TYPES,
        widget=forms.Select()
    )
    is_staff = forms.BooleanField(
        required=False,
        label='Backend admin (Django Staff)',
        help_text=_(
            'Designates whether the user can access '
            'the backend (Django) admin site.'
        )
    )

    def clean_username(self):
        """Check username."""
        username = self.cleaned_data['username']
        if User.objects.exclude(
                id=self.instance.id).filter(username=username).count():
            raise ValidationError(
                "A user with that username already exists."
            )
        return username

    def clean_is_staff(self):
        """Check is_staff."""
        role = self.cleaned_data['role']
        is_staff = self.cleaned_data.get('is_staff', False)
        if role == ROLES.SUPER_ADMIN.name:
            return is_staff
        return False

    def clean_password(self):
        """Check password."""
        return make_password(self.cleaned_data['password'])

    class Meta:  # noqa: D106
        model = User
        fields = (
            'first_name', 'last_name', 'username',
            'email', 'role', 'is_staff', 'password'
        )

    @staticmethod
    def model_to_initial(model: User):
        """Return model data as json."""
        initial = model_to_dict(model)
        initial['role'] = model.profile.role
        return initial


class UserEditForm(UserForm):
    """Form for user edit."""

    class Meta:  # noqa: D106
        model = User
        fields = (
            'first_name', 'last_name', 'username',
            'email', 'role', 'is_staff',
        )
