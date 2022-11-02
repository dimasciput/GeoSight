"""Harvester Detail view."""
import json

from django.http import Http404, HttpResponseBadRequest
from django.shortcuts import reverse, redirect

from frontend.views._base import BaseView
from frontend.views.admin.harvesters.forms import HarvesterFormView
from geosight.data.models import Indicator, ContextLayer
from geosight.harvester.models import (
    Harvester, ExcelHarvesterWideFormatHarvester,
    ExcelHarvesterLongFormatHarvester, UsingExposedAPI
)
from geosight.harvester.serializer.harvester import (
    HarvesterSerializer, HarvesterLogSerializer, HarvesterAttributeSerializer
)
from geosight.harvester.tasks import run_harvester
from geosight.permission.access import edit_permission_resource


class HarvesterDetail(BaseView):
    """Harvester Detail View."""

    template_name = 'frontend/admin/harvesters/detail.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Harvester Detail'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        harvester = self.harvester
        unique_id = harvester.unique_id
        list_url = reverse('admin-harvester-list-view')
        detail_view = reverse('harvester-detail-view', kwargs={
            'uuid': unique_id
        })
        return (
            f'<a href="{list_url}">Harvesters</a> '
            f'<span>></span> '
            f'<a href="{detail_view}">{unique_id}</a> '
        )

    @property
    def harvester(self):
        """Return harvester data."""
        try:
            return Harvester.objects.get(
                unique_id=self.kwargs.get('uuid', '')
            )
        except Indicator.DoesNotExist:
            raise Http404('Harvester does not exist')

    def context_data(self, harvester: Harvester):
        """Parse context."""
        last_log = harvester.harvesterlog_set.first()
        current_log = HarvesterLogSerializer(
            last_log
        ).data if last_log else None
        current_log_detail = ''
        if current_log:
            current_log_detail = current_log['html_detail']
            del current_log['html_detail']
            del current_log['detail']

        # -------------------------------------------
        # Overide the attributes detail
        attributes = HarvesterAttributeSerializer(
            harvester.get_attributes(), many=True
        ).data
        try:
            for attr in attributes:
                if attr['name'] == 'Context Layer ID':
                    ctx_layer = ContextLayer.objects.get(
                        id=attr['value']
                    )
                    attr['name'] = 'Context Layer'
                    attr['value'] = (
                        f'{ctx_layer.group.name}/{ctx_layer.__str__()}'
                    )
        except ContextLayer.DoesNotExist:
            pass
        # -------------------------------------------

        context = {
            'edit_url': reverse(
                HarvesterFormView.get_url_edit_name(harvester.harvester_class),
                args=[harvester.unique_id]
            ),
            'harvester': json.dumps(HarvesterSerializer(harvester).data),
            'attributes': json.dumps(attributes),
            'current_log': json.dumps(current_log) if current_log else None,
            'current_log_detail': current_log_detail,
            'can_harvest_now': True
        }
        if harvester.harvester_class in [
            ExcelHarvesterWideFormatHarvester[0],
            ExcelHarvesterLongFormatHarvester[0],
            UsingExposedAPI[0]

        ]:
            context['can_harvest_now'] = False
        return context

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        harvester = self.harvester
        edit_permission_resource(harvester, self.request.user)
        context.update(self.context_data(harvester))
        return context

    def post(self, request, uuid):
        """POST to force harvester to harvest."""
        try:
            harvester = Harvester.objects.get(
                unique_id=self.kwargs.get('uuid', '')
            )
            edit_permission_resource(harvester, self.request.user)
        except Indicator.DoesNotExist:
            raise Http404('Harvester does not exist')
        if harvester.harvester_class in [
            ExcelHarvesterWideFormatHarvester[0],
            ExcelHarvesterLongFormatHarvester[0],
            UsingExposedAPI[0]

        ]:
            return HttpResponseBadRequest('Harvester can not be harvested')
        try:
            run_harvester.delay(harvester.pk)
            return redirect(
                reverse(
                    'harvester-detail',
                    args=[str(harvester.unique_id)]
                )
            )
        except Harvester.DoesNotExist:
            raise Http404('harvester does not exist')
