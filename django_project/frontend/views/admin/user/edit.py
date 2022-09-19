"""Admin User Edit View."""

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect, reverse, render

from core.forms.user import UserEditForm
from frontend.views._base import BaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin

User = get_user_model()


class UserEditView(RoleSuperAdminRequiredMixin, BaseView):
    """User Edit View."""

    template_name = 'frontend/admin/user/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit User'

    @property
    def content_title(self):
        """Return content title that used on page title user."""
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )
        list_url = reverse('admin-user-list-view')
        edit_url = reverse('admin-user-edit-view', args=[user.id])
        return (
            f'<a href="{list_url}">Users</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{user.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )

        context.update(
            {
                'form': UserEditForm(
                    initial=UserEditForm.model_to_initial(user)
                )
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit user."""
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )
        form = UserEditForm(
            request.POST,
            instance=user
        )
        if form.is_valid():
            user = form.save()
            user.profile.role = form.cleaned_data['role']
            user.profile.save()
            return redirect(reverse('admin-user-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
