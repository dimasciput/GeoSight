"""Data Importer Detail view."""
from django.shortcuts import reverse

from frontend.views.admin.harvesters.detail import HarvesterDetail


class DataImporterDetail(HarvesterDetail):
    """Data Importer Detail View."""

    template_name = 'frontend/admin/data_importer/detail.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Data Importer Detail'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        harvester = self.harvester
        unique_id = harvester.unique_id
        list_url = reverse('admin-data-importer-list-view')
        detail_view = reverse('data-importer-detail-view', kwargs={
            'uuid': unique_id
        })
        return (
            f'<a href="{list_url}">Data Importer</a> '
            f'<span>></span> '
            f'<a href="{detail_view}">{unique_id}</a> '
        )
