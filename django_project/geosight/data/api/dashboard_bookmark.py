"""Dashboard Bookmark API.."""
import json

from django.db import transaction
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.forms.dashboard_bookmark import DashboardBookmarkForm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.dashboard import DashboardBookmark
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardIndicatorLayer
)
from geosight.data.serializer.dashboard_bookmark import (
    DashboardBookmarkSerializer
)


class DashboardBookmarkAPI(APIView):
    """Return Dashboard Bookmark list."""

    def get(self, request, slug):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        first_layer = dashboard.dashboardindicatorlayer_set.filter(
            visible_by_default=True).first()
        # default data
        default = DashboardBookmarkSerializer(
            DashboardBookmark(
                id=0,
                name='Default',
                extent=dashboard.extent,
                selected_basemap=dashboard.dashboardbasemap_set.filter(
                    visible_by_default=True
                ).first().object,
                selected_indicator_layer=first_layer,
                filters=dashboard.filters
            )
        ).data

        context_layers = dashboard.dashboardcontextlayer_set
        default['selected_context_layers'] = context_layers.filter(
            visible_by_default=True
        ).values_list('object__id', flat=True)

        data = [default] + DashboardBookmarkSerializer(
            dashboard.dashboardbookmark_set, many=True
        ).data
        return Response(data)


class DashboardAPI(APIView):
    """Return Dashboard Bookmark detail."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def save_bookmark(self, request, dashboard, bookmark):
        """Save bookmark."""
        data = DashboardBookmarkForm.update_data(
            json.loads(request.POST.copy()['data'])
        )
        data['dashboard'] = dashboard.id
        data['creator'] = request.user

        try:
            data['selected_basemap'] = BasemapLayer.objects.get(
                id=data['selectedBasemap']
            )
        except BasemapLayer.DoesNotExist:
            return HttpResponseBadRequest(
                f'{data["selectedBasemap"]} does not exist')

        try:
            layer = dashboard.dashboardindicatorlayer_set.get(
                id=data['selectedIndicatorLayer']
            )
            data['selected_indicator_layer'] = layer
        except DashboardIndicatorLayer.DoesNotExist:
            return HttpResponseBadRequest(
                f'{data["selectedIndicatorLayer"]} does not exist')

        form = DashboardBookmarkForm(data, instance=bookmark)
        if form.is_valid():
            try:
                with transaction.atomic():
                    dashboard = form.save()
                    dashboard.save_relations(data)
                    return Response('Created')
            except Exception as e:
                return HttpResponseBadRequest(e)
        else:
            errors = [''.join(value) for key, value in form.errors.items()]
            return HttpResponseBadRequest('<br>'.join(errors))


class DashboardBookmarkDetailAPI(DashboardAPI):
    """Return Dashboard Bookmark detail."""

    def post(self, request, slug, pk):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        try:
            bookmark = dashboard.dashboardbookmark_set.get(id=pk)
        except DashboardBookmark.DoesNotExist:
            return HttpResponseBadRequest('Bookmark does not exist')
        return self.save_bookmark(request, dashboard, bookmark)

    def delete(self, request, slug, pk):
        """Delete an basemap."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        try:
            bookmark = dashboard.dashboardbookmark_set.get(id=pk)
        except DashboardBookmark.DoesNotExist:
            return HttpResponseBadRequest('Bookmark does not exist')
        bookmark.delete()
        return Response('Deleted')


class DashboardBookmarkCreateAPI(DashboardAPI):
    """Return all dashboard data."""

    def post(self, request, slug):
        """Return Dashboard Bookmark list."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        return self.save_bookmark(request, dashboard, None)
