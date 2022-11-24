"""API for push data."""
from datetime import datetime

from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models import IndicatorValue, IndicatorValueRejectedError
from geosight.data.serializer.indicator import IndicatorValueBasicSerializer
from geosight.harvester.authentication import (
    HarvesterTokenAndBearerAuthentication
)
from geosight.harvester.models import Harvester


class HarvesterPushIndicatorValues(APIView):
    """Return Scenario value for country with the indicator geometry level."""

    authentication_classes = (HarvesterTokenAndBearerAuthentication,)

    def post(self, request, uuid):
        """Save value for specific date.

        :param uuid: uuid of the harvester
        :return:
        """
        try:
            data = request.data
            harvester = get_object_or_404(Harvester, unique_id=uuid)
            indicator = harvester.indicator

            # Validate the data
            try:
                date = datetime.strptime(
                    data['date'], "%Y-%m-%d").date()
            except ValueError:
                return HttpResponseBadRequest(
                    'Date format should be YYYY-MM-DD')

            # extra data needs to be dictionary
            extra_data = data.get('extra_data', None)
            if extra_data:
                try:
                    extra_data.keys()
                except AttributeError:
                    return HttpResponseBadRequest(
                        'The extra_data needs to be json')

            # Check if value already exist
            geometry_code = data['geometry_code']
            try:
                indicator.indicatorvalue_set.get(
                    date=date,
                    geom_identifier=geometry_code
                )
                return HttpResponseBadRequest(
                    'The value on this date already exist')
            except IndicatorValue.DoesNotExist:
                pass
            indicator_value = indicator.save_value(
                date, geometry_code, data['value'],
                reference_layer=harvester.reference_layer,
                admin_level=harvester.admin_level,
                extras=extra_data,
            )
            return Response(
                IndicatorValueBasicSerializer(indicator_value).data
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')
        except IndicatorValueRejectedError as e:
            return HttpResponseBadRequest(f'{e}')


class HarvesterPushIndicatorValuesBatch(APIView):
    """Return Scenario value for country with the indicator geometry level."""

    authentication_classes = (HarvesterTokenAndBearerAuthentication,)

    def post(self, request, uuid):
        """Save value for specific date.

        :param uuid: uuid of the instance
        :return:
        """
        try:
            rows = request.data
            harvester = get_object_or_404(Harvester, unique_id=uuid)
            indicator = harvester.indicator

            replace = False
            if 'replace' in request.query_params:
                replace = eval(request.query_params['replace'])

            if replace:
                indicator.indicatorvalue_set.all().delete()

            indicator_values = []
            for data in rows:
                # Validate the data
                try:
                    date = datetime.strptime(
                        data['date'], "%Y-%m-%d").date()
                except ValueError:
                    return HttpResponseBadRequest(
                        'Date format should be YYYY-MM-DD')
                try:
                    value = float(data['value'])
                except ValueError:
                    return HttpResponseBadRequest('Value need to be number')

                # extra data needs to be dictionary
                extra_data = data.get('extra_data', None)
                if extra_data:
                    try:
                        extra_data.keys()
                    except AttributeError:
                        return HttpResponseBadRequest(
                            'The extra_data needs to be json')

                # Check if value already exist
                try:
                    geometry_code = data['geometry_code']
                    indicator.indicatorvalue_set.get(
                        date=date,
                        geom_identifier=geometry_code
                    )
                    continue
                except IndicatorValue.DoesNotExist:
                    pass
                indicator_values.append(
                    indicator.save_value(
                        date, geometry_code, value,
                        reference_layer=harvester.reference_layer,
                        admin_level=harvester.admin_level,
                        extras=extra_data
                    )
                )
            return Response(
                IndicatorValueBasicSerializer(
                    indicator_values, many=True).data
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')
        except IndicatorValueRejectedError as e:
            return HttpResponseBadRequest(f'{e}')
        except NameError:
            return HttpResponseBadRequest('replace needs to be True or False')
