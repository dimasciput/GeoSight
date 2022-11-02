"""Admin ImportData List View."""

from django.shortcuts import reverse

from frontend.views._base import BaseView
from frontend.views.admin.harvesters.forms.meta_ingestor_long_format import (
    MetaIngestorLongFormatForm
)
from frontend.views.admin.harvesters.forms.meta_ingestor_wide_format import (
    MetaIngestorWideFormatForm,
)
from geosight.permission.access import RoleCreatorRequiredMixin


class DataImporterListView(RoleCreatorRequiredMixin, BaseView):
    """ImportData List View."""

    template_name = 'frontend/admin/data_importer/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Data Importer'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-data-importer-list-view')
        return f'<a href="{list_url}">Data Importer</a> '

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
        })
        return context
