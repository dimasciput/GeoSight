"""Admin Users List View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin


class UserListView(RoleSuperAdminRequiredMixin, BaseView):
    """User Detail View."""

    template_name = 'frontend/admin/user/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Users'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-user-list-view')
        return f'<a href="{list_url}">Users</a> '
