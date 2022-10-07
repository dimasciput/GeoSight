"""VectorContextLayerHarvester harvester view."""

import json

from django.db.models import Q

from geosight.data.models.context_layer import ContextLayer, LayerType
from geosight.data.serializer.context_layer import ContextLayerSerializer
from geosight.harvester.harveters.vector_context_layer_harvester import (
    VectorContextLayerHarvester, SPATIAL_METHOD, SPATIAL_METHOD_STRING,
    AGGREGATIONS
)
from geosight.harvester.models.harvester import Harvester
from geosight.harvester.models.harvester_log import HarvesterLog, LogStatus
from geosight.harvester.tasks import run_harvester
from ._base import HarvesterFormView


class VectorContextLayerHarvesterView(HarvesterFormView):
    """VectorContextLayerHarvester harvester view."""

    harvester_class = VectorContextLayerHarvester
    template_name = (
        'frontend/admin/harvesters/vector_context_layer_harvester.html'
    )

    def context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().context_data(**kwargs)
        attributes = []
        for attr in context['attributes']:
            if attr['name'] == 'context_layer_id':
                attr['title'] = 'Context layer'
                attr['type'] = 'select'
                attr['description'] = 'Context layer that will be used.'
                options = []
                for context_layer in ContextLayer.objects.filter(
                        Q(layer_type=LayerType.ARCGIS)
                ).order_by('group__name', 'name'):
                    row = ContextLayerSerializer(context_layer).data
                    row['value'] = context_layer.id
                    row['name'] = (
                        f'{context_layer.group.name}/{context_layer.name}'
                    )
                    options.append(row)
                attr['options'] = options
            attributes.append(attr)
        context['attributes'] = attributes
        context['formDefinitions'] = json.dumps(
            {
                'spatial_method': [
                    {
                        'value': SPATIAL_METHOD.INTERSECT,
                        'name': SPATIAL_METHOD_STRING.INTERSECT,
                    },
                    {
                        'value': SPATIAL_METHOD.DISTANCE_WITHIN,
                        'name': SPATIAL_METHOD_STRING.DISTANCE_WITHIN,
                    },
                    {
                        'value': SPATIAL_METHOD.COMPLETELY_WITHIN,
                        'name': SPATIAL_METHOD_STRING.COMPLETELY_WITHIN,
                    },
                    {
                        'value': SPATIAL_METHOD.CENTROID_WITHIN,
                        'name': SPATIAL_METHOD_STRING.CENTROID_WITHIN,
                    },
                ],
                'spatial_method_distance_value': (
                    SPATIAL_METHOD.DISTANCE_WITHIN
                ),
                'aggregation': [
                    {
                        'value': AGGREGATIONS.COUNT,
                        'name': AGGREGATIONS.COUNT,
                    },
                    {
                        'value': AGGREGATIONS.SUM,
                        'name': AGGREGATIONS.SUM,
                    },
                    {
                        'value': AGGREGATIONS.MAX,
                        'name': AGGREGATIONS.MAX,
                    },
                    {
                        'value': AGGREGATIONS.MIN,
                        'name': AGGREGATIONS.MIN,
                    },
                    {
                        'value': AGGREGATIONS.AVG,
                        'name': AGGREGATIONS.AVG,
                    },
                ],
                'aggregation_count': AGGREGATIONS.COUNT,
            }
        )
        return context

    def after_post(self, harvester: Harvester):
        """For calling after post success."""
        HarvesterFormView.after_post(self, harvester)
        HarvesterLog.objects.get_or_create(
            harvester=harvester,
            status=LogStatus.START
        )
        run_harvester.delay(harvester.pk)
