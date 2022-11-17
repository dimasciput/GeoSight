"""Admin Group Edit View."""

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect, reverse, render

from core.forms.group import GroupForm
from core.models.group import GeosightGroup
from frontend.views._base import BaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin

User = get_user_model()


class GroupEditView(RoleSuperAdminRequiredMixin, BaseView):
    """Group Edit View."""

    template_name = 'frontend/admin/group/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Group'

    @property
    def content_title(self):
        """Return content title that used on page title group."""
        group = get_object_or_404(
            GeosightGroup, pk=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-group-list-view')
        edit_url = reverse('admin-group-edit-view', args=[group.id])
        return (
            f'<a href="{list_url}">Groups</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{group.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        group = get_object_or_404(
            GeosightGroup, pk=self.kwargs.get('pk', '')
        )
        detail_api_url = reverse('group-detail-api', args=[group.id])

        context.update(
            {
                'form': GroupForm(
                    initial=GroupForm.model_to_initial(group)
                ),
                'group_detail_api': detail_api_url
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit group."""
        group = get_object_or_404(
            GeosightGroup, pk=self.kwargs.get('pk', '')
        )
        form = GroupForm(
            request.POST,
            instance=group
        )
        if form.is_valid():
            group = form.save()
            for user in group.user_set.all():
                user.groups.remove(group)

            # Add user to group
            for _id in request.POST.get('users', '').split(','):
                try:
                    user = User.objects.get(id=_id)
                    user.groups.add(group)
                except (ValueError, User.DoesNotExist):
                    pass
            return redirect(reverse('admin-group-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
