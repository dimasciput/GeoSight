"""Context Analysis API.."""
from datetime import datetime

from dateutil import parser as date_parser
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.dashboard import (
    Dashboard, DashboardIndicator
)
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.dashboard import (
    DashboardBasicSerializer, DashboardSerializer
)
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from geosight.permission.access import (
    delete_permission_resource, read_permission_resource
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.resource import (
    ReferenceLayerIndicatorPermission
)


class DashboardListAPI(APIView):
    """Return DashboardLayer list."""

    def get(self, request):
        """Return DashboardLayer list."""
        return Response(
            DashboardBasicSerializer(
                Dashboard.permissions.list(request.user).order_by('name'),
                many=True, context={'user': request.user}
            ).data
        )


CREATE_SLUG = ':CREATE'


class DashboardDetail(APIView):
    """Return all dashboard data."""

    permission_classes = (IsAuthenticated,)

    def delete(self, request, slug):
        """Delete an basemap."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        delete_permission_resource(dashboard, request.user)
        dashboard.delete()
        return Response('Deleted')


class DashboardData(APIView):
    """Return all dashboard data."""

    def get(self, request, slug):
        """Return all context analysis data."""
        if slug != CREATE_SLUG:
            dashboard = get_object_or_404(Dashboard, slug=slug)
            data = DashboardSerializer(
                dashboard, context={'user': request.user}).data
        else:
            dashboard = Dashboard()
            data = DashboardSerializer(
                dashboard, context={'user': request.user}).data

        return Response(data)


class DashboardIndicatorValuesAPI(APIView):
    """API for Values of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        ref, created = ReferenceLayerIndicator.permissions.get_or_create(
            user=request.user,
            indicator=indicator,
            have_creator=False,
            reference_layer=dashboard.reference_layer
        )
        try:
            read_permission_resource(ref, request.user)
        except ReferenceLayerIndicatorPermission.DoesNotExist:
            ref.permission = ReferenceLayerIndicatorPermission(
                organization_permission=PERMISSIONS.NONE.name,
                public_permission=PERMISSIONS.NONE.name
            )
            read_permission_resource(ref, request.user)

        # If there is dashboard indicator, use it's rule
        rule_set = None
        try:
            dashboard_indicator = dashboard.dashboardindicator_set.get(
                object=indicator)

            if dashboard_indicator.dashboardindicatorrule_set.count():
                rule_set = dashboard_indicator.dashboardindicatorrule_set.all()
        except DashboardIndicator.DoesNotExist:
            pass

        time_limit = request.GET.get('time__lte', None)
        if time_limit:
            time_limit = date_parser.isoparse(time_limit)
        else:
            time_limit = datetime.now()

        return Response(
            indicator.values(
                time_limit, rule_set=rule_set,
                reference_layer=dashboard.reference_layer
            )
        )


class DashboardIndicatorDatesAPI(APIView):
    """API for of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, slug, pk, **kwargs):
        """Return Values."""
        dashboard = get_object_or_404(Dashboard, slug=slug)
        indicator = get_object_or_404(Indicator, pk=pk)
        ref, created = ReferenceLayerIndicator.permissions.get_or_create(
            user=request.user,
            indicator=indicator,
            have_creator=False,
            reference_layer=dashboard.reference_layer
        )
        try:
            read_permission_resource(ref, request.user)
        except ReferenceLayerIndicatorPermission.DoesNotExist:
            ref.permission = ReferenceLayerIndicatorPermission(
                organization_permission=PERMISSIONS.NONE.name,
                public_permission=PERMISSIONS.NONE.name
            )
            read_permission_resource(ref, request.user)

        dates = [
            datetime.combine(date_str, datetime.max.time()).isoformat()
            for date_str in set(
                indicator.query_values(
                    reference_layer=dashboard.reference_layer
                ).values_list('date', flat=True)
            )
        ]
        dates.sort()

        return Response(dates)
