"""Admin Dashboards List View."""

from braces.views import SuperuserRequiredMixin
from django.shortcuts import reverse

from frontend.views._base import BaseView


class DashboardListView(SuperuserRequiredMixin, BaseView):
    """Dashboard Detail View."""

    template_name = 'frontend/admin/dashboard/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Projects'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-dashboard-list-view')
        return f'<a href="{list_url}">Projects</a>'
