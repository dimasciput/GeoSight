"""Admin Dataset View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin


class DataAccessAdminView(RoleSuperAdminRequiredMixin, BaseView):
    """DataAccess Admin View."""

    template_name = 'frontend/admin/dataset/data-access.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Data Access'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-data-access-view')
        return f'<a href="{list_url}">Data Access</a>'
