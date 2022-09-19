"""Dashboard Detail View."""
from django.shortcuts import get_object_or_404

from frontend.views.dashboard._base import BaseDashboardView
from geosight.data.models.dashboard import Dashboard
from geosight.permission.access import read_permission_resource


class DashboardDetailView(BaseDashboardView):
    """Dashboard Detail View."""

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'Dashboard detail'

    @property
    def header_title(self):
        """Return content title that will be show on the header."""
        dashboard = get_object_or_404(
            Dashboard, slug=self.kwargs.get('slug', '')
        )
        return "Project : " + dashboard.name

    def get_context_data(self, slug, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        dashboard = get_object_or_404(
            Dashboard, slug=slug
        )
        read_permission_resource(dashboard, self.request.user)
        context['dashboard'] = {'id': dashboard.slug}
        return context
