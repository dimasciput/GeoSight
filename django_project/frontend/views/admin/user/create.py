"""Admin User Create View."""

from django.contrib.auth import get_user_model
from django.shortcuts import redirect, reverse, render

from core.forms.user import UserForm
from frontend.views._base import BaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin

User = get_user_model()


class UserCreateView(RoleSuperAdminRequiredMixin, BaseView):
    """User Create View."""

    template_name = 'frontend/admin/user/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create User'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-user-list-view')
        create_url = reverse('admin-user-create-view')
        return (
            f'<a href="{list_url}">Users</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context.update(
            {
                'form': UserForm()
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.profile.role = form.cleaned_data['role']
            user.profile.save()
            return redirect(reverse('admin-user-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
