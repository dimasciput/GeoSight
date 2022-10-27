"""Admin Harvesters List View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from frontend.views.admin.harvesters import (
    MetaIngestorWideFormatForm,
    MetaIngestorLongFormatForm,
    HarvestedUsingExposedAPIByExternalClientView
)
from geosight.permission.access import RoleCreatorRequiredMixin


class HarvesterListView(RoleCreatorRequiredMixin, BaseView):
    """Basemap Detail View."""

    template_name = 'frontend/admin/harvesters/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Harvesters'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-harvester-list-view')
        return f'<a href="{list_url}">Harvesters</a> '

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context.update({
            'meta_ingestor_wide_format': reverse(
                MetaIngestorWideFormatForm().url_create_name
            ),
            'meta_ingestor_long_format': reverse(
                MetaIngestorLongFormatForm().url_create_name
            ),
            'create_harvester_api': reverse(
                HarvestedUsingExposedAPIByExternalClientView().url_create_name
            ),
        })
        return context
