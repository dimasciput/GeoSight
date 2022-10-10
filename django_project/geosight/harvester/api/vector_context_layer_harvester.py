"""Return test of data.."""

from http import HTTPStatus

from django.http import JsonResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.indicator import Indicator
from geosight.georepo.models.reference_layer import ReferenceLayer
from geosight.harvester.models.harvester import (
    Harvester, VectorContextLayerHarvester
)


class VectorContextLayerTestConfiguration(APIView):
    """Return Data of context layer test."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        """Return Data of context layer test."""
        data = request.data
        try:
            indicator = Indicator.objects.get(id=data['indicator'])
            reference_layer = ReferenceLayer.objects.get(
                identifier=data['reference_layer'])
            harvester = Harvester(
                indicator=indicator,
                harvester_class=VectorContextLayerHarvester[0],
                reference_layer=reference_layer,
                admin_level=data['admin_level']
            )
            harvester = harvester.get_harvester_class(harvester)
            harvester.attributes = {
                'context_layer_id': data['context_layer_id'],
                'geometry_type': data['geometry_type'],
                'filter': data['filter'],
                'spatial_operator': data['spatial_operator'],
                'aggregation': data['aggregation']
            }
            rows = harvester.return_rows(codes=data['codes'].split(','))
            date = timezone.now().date()
            output = []
            for idx, row in enumerate(rows):
                output.append({
                    "id": idx,
                    "reference_layer": reference_layer.identifier,
                    "name": reference_layer.name,
                    "indicator": indicator.__str__(),
                    "date": date.strftime("%Y-%m-%d"),
                    "value": row[0],
                    "geom_identifier": row[1],
                    "admin_level": data['admin_level']
                })

            return Response(output)
        except Indicator.DoesNotExist:
            return JsonResponse({
                'message': HTTPStatus.BAD_REQUEST,
                'detail': (
                    f'{HTTPStatus.BAD_REQUEST} - '
                    f'Indicator {data["indicator"]} does not exist.'
                )
            }, status=HTTPStatus.BAD_REQUEST)
        except ReferenceLayer.DoesNotExist:
            return JsonResponse({
                'message': HTTPStatus.BAD_REQUEST,
                'detail': (
                    f'{HTTPStatus.BAD_REQUEST} - '
                    f'Reference Layer {data["reference_layer"]} '
                    f'does not recognized by geosight.'
                )
            }, status=HTTPStatus.BAD_REQUEST)
        except Exception as e:
            return JsonResponse({
                'message': HTTPStatus.BAD_REQUEST,
                'detail': f'{HTTPStatus.BAD_REQUEST} - {e}'
            }, status=HTTPStatus.BAD_REQUEST)
