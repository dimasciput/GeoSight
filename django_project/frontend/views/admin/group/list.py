"""Admin Groups List View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin


class GroupListView(RoleSuperAdminRequiredMixin, BaseView):
    """Group Detail View."""

    template_name = 'frontend/admin/group/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Groups'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-group-list-view')
        return f'<a href="{list_url}">Groups</a> '
