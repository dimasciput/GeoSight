"""Admin Basemaps List View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.permission.access import RoleContributorRequiredMixin


class BasemapListView(RoleContributorRequiredMixin, BaseView):
    """Basemap Detail View."""

    template_name = 'frontend/admin/basemap/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Basemaps'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-basemap-list-view')
        return f'<a href="{list_url}">Basemaps</a> '
