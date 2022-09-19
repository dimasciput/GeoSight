"""Admin Indicators List View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.permission.access import RoleContributorRequiredMixin


class IndicatorListView(RoleContributorRequiredMixin, BaseView):
    """Indicator Detail View."""

    template_name = 'frontend/admin/indicator/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Indicators'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-indicator-list-view')
        return f'<a href="{list_url}">Indicators</a> '
