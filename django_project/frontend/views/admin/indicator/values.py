"""Admin Indicators Value List View."""

from braces.views import SuperuserRequiredMixin
from django.shortcuts import get_object_or_404
from django.shortcuts import reverse

from frontend.views._base import BaseView
from geosight.data.models.indicator import Indicator


class IndicatorValueListView(SuperuserRequiredMixin, BaseView):
    """Indicator Detail View."""

    template_name = 'frontend/admin/indicator/values.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Indicator Values'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-indicator-list-view')
        edit_url = reverse('admin-indicator-edit-view', args=[indicator.id])
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{indicator.__str__()}</a> '
            f'<span>></span> '
            '<a>Values</a>'
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )

        context.update(
            {
                'indicator_id': indicator.id
            }
        )
        return context
