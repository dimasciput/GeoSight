"""Context Analysis API.."""
from datetime import datetime

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.models.dashboard import (
    Dashboard, DashboardIndicator
)
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.dashboard import (
    DashboardBasicSerializer, DashboardSerializer
)


class DashboardListAPI(APIView):
    """Return DashboardLayer list."""

    def get(self, request):
        """Return DashboardLayer list."""
        return Response(
            DashboardBasicSerializer(
                Dashboard.objects.order_by('name'), many=True
            ).data
        )


CREATE_SLUG = ':CREATE'


class DashboardDetail(APIView):
    """Return all dashboard data."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission,)

    def delete(self, request, slug):
        """Delete an basemap."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        dashboard.delete()
        return Response('Deleted')


class DashboardData(APIView):
    """Return all dashboard data."""

    def get(self, request, slug):
        """Return all context analysis data."""
        if slug != CREATE_SLUG:
            dashboard = get_object_or_404(Dashboard, slug=slug)
            data = DashboardSerializer(dashboard).data
        else:
            dashboard = Dashboard()
            data = DashboardSerializer(dashboard).data

        return Response(data)


class DashboardIndicatorValuesAPI(APIView):
    """API for Values of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)

        # If there is dashboard indicator, use it's rule
        rule_set = None
        try:
            dashboard_indicator = dashboard.dashboardindicator_set.get(
                object=indicator)

            if dashboard_indicator.dashboardindicatorrule_set.count():
                rule_set = dashboard_indicator.dashboardindicatorrule_set.all()
        except DashboardIndicator.DoesNotExist:
            pass

        return Response(
            indicator.values(
                datetime.now(), rule_set=rule_set,
                reference_layer=dashboard.reference_layer
            )
        )
