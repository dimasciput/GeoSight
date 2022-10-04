"""API for indicator value."""
import json

import requests
from django.http import HttpResponseBadRequest, HttpResponseNotFound
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import AdminAuthenticationPermission
from geosight.data.models.indicator import (
    Indicator, IndicatorValueRejectedError, IndicatorValue
)
from geosight.data.serializer.indicator import (
    IndicatorValueBasicSerializer, IndicatorValueSerializer,
    IndicatorValueDetailSerializer
)
from geosight.georepo.request import GeorepoUrl
from geosight.permission.access import (
    delete_permission_resource, read_permission_resource
)


class IndicatorValuesByGeometry(APIView):
    """Return Scenario value for the specific geometry for all date."""

    permission_classes = (IsAuthenticated, AdminAuthenticationPermission)

    def get(self, request, pk, geometry_code):
        """Return values of the indicator.

        :param pk: pk of the indicator
        :param geometry_code: the geometry code
        :return:
        """
        indicator = get_object_or_404(Indicator, pk=pk)
        values = indicator.indicatorvalue_set.filter(
            geom_identifier=geometry_code).order_by('-date')
        return Response(IndicatorValueBasicSerializer(values, many=True).data)

    def post(self, request, pk, geometry_code):
        """Return values of the indicator.

        :param pk: pk of the indicator
        :param geometry_code: the geometry code
        :return:
        """
        indicator = get_object_or_404(Indicator, pk=pk)
        reference_layer = request.POST.get('reference_layer', None)
        admin_level = request.POST.get('admin_level', None)
        try:
            value = float(request.POST['value'])
            indicator.save_value(
                request.POST['date'], geometry_code, value,
                reference_layer=reference_layer,
                admin_level=admin_level
            )
            return Response('OK')
        except ValueError:
            return HttpResponseBadRequest('Value is not a number')
        except IndicatorValueRejectedError as e:
            return HttpResponseBadRequest(f'{e}')


class IndicatorValueDetail(APIView):
    """Return Scenario value for the specific geometry for all date."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, value_id):
        """Return extra values of the indicator.

        :param pk: pk of the indicator
        :param value_id: the id of value
        :return:
        """
        indicator = get_object_or_404(Indicator, pk=pk)
        try:
            indicator_value = indicator.indicatorvalue_set.get(pk=value_id)
            read_permission_resource(indicator_value, request.user)
            return Response(
                IndicatorValueDetailSerializer(indicator_value).data
            )
        except IndicatorValue.DoesNotExist:
            return HttpResponseNotFound('Not found')

    def delete(self, request, pk, value_id):
        """Delete an value."""
        indicator = get_object_or_404(Indicator, pk=pk)
        try:
            indicator_value = indicator.indicatorvalue_set.get(pk=value_id)
            delete_permission_resource(indicator, request.user)
            indicator_value.delete()
            return Response('Deleted')
        except IndicatorValue.DoesNotExist:
            return HttpResponseNotFound('Not found')


class IndicatorValueListAPI(APIView):
    """API for Values of indicator."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, **kwargs):
        """Return Values."""
        indicator = get_object_or_404(Indicator, pk=pk)
        read_permission_resource(indicator, request.user)
        georepo = GeorepoUrl()
        r = requests.get(georepo.reference_layer_list)
        references_map = {}
        for reference in r.json():
            references_map[reference['identifier']] = reference['name']

        return Response(
            IndicatorValueSerializer(
                indicator.indicatorvalue_set.all(), many=True, context={
                    'references_map': references_map
                }
            ).data
        )

    def delete(self, request, pk):
        """Delete an value."""
        indicator = get_object_or_404(Indicator, pk=pk)
        delete_permission_resource(indicator, request.user)
        ids = request.POST.get('ids', None)
        if not ids:
            return HttpResponseNotFound('ids is needed')
        ids = json.loads(ids)
        try:
            values = indicator.indicatorvalue_set.filter(pk__in=ids)
            values.delete()
            return Response('Deleted')
        except IndicatorValue.DoesNotExist:
            return HttpResponseNotFound('Not found')
