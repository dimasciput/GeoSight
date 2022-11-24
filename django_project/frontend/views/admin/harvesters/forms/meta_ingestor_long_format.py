"""MetaIngestor View."""

from django.shortcuts import reverse

from geosight.harvester.harveters.excel_harvester_long_format import (
    ExcelHarvesterLongFormat
)
from geosight.harvester.models.harvester import (
    ExcelHarvesterLongFormatHarvester, ExcelHarvesterWideFormatHarvester
)
from geosight.harvester.models.harvester import Harvester
from geosight.harvester.models.harvester_log import HarvesterLog, LogStatus
from geosight.harvester.tasks import run_harvester
from ._base import HarvesterFormView


class MetaIngestorLongFormatForm(HarvesterFormView):
    """Meta Ingestor Wide Format View."""

    harvester_class = ExcelHarvesterLongFormat
    template_name = 'frontend/admin/harvesters/meta_ingestor_long_format.html'
    redirect_url_name = 'data-importer-detail-view'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Import data from Excel (LONG format)'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-data-importer-list-view')
        unique_id = self.kwargs.get('uuid', None)
        if unique_id:
            detail_view = reverse('data-importer-detail-view', kwargs={
                'uuid': unique_id
            })
            return (
                f'<a href="{list_url}">Data Importer</a> '
                f'<span>></span> '
                f'<a href="{detail_view}">{unique_id}</a> '
                f'<span>></span> '
                f'<a>Edit</a> '
            )
        else:
            return (
                f'<a href="{list_url}">Data Importer</a> '
                f'<span>></span> '
                f'<a>{ExcelHarvesterLongFormatHarvester[1]}</a>'
            )

    def get_harvester(self) -> Harvester:
        """Return harvester."""
        uuid = self.kwargs.get('uuid', None)
        if not uuid:
            raise Harvester.DoesNotExist()
        return Harvester.objects.get(
            unique_id=uuid
        )

    @property
    def harvesters(self) -> tuple:
        """Return harvesters."""
        return (
            ExcelHarvesterWideFormatHarvester,
            ExcelHarvesterLongFormatHarvester,
        )

    def context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().context_data(**kwargs)
        for attr in context['attributes']:
            if attr['name'] == 'file':
                attr['title'] = 'File'
                attr['type'] = 'file'
                attr['description'] = (
                    'Upload file that will be used to save the data'
                )
                attr['file_accept'] = '.xlsx,.xls'
        return context

    def after_post(self, harvester: Harvester):
        """For calling after post success."""
        harvester.creator = self.request.user
        HarvesterLog.objects.get_or_create(
            harvester=harvester,
            status=LogStatus.START
        )
        harvester.save()
        run_harvester.delay(harvester.pk)
