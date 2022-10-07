"""GeoSight Harvester urls."""
from django.conf.urls import url
from django.urls import include

from geosight.harvester.api.harvester import (
    HarvesterLogData, HarvesterListAPI, HarvesterDetailAPI
)
from geosight.harvester.api.harvester_push_api import (
    HarvesterPushIndicatorValues, HarvesterPushIndicatorValuesBatch
)
from geosight.harvester.api.sharepoint import SharepointFileDetail
from geosight.harvester.api.vector_context_layer_harvester import (
    VectorContextLayerTestConfiguration
)

harvester_api = [
    url(
        r'^upload/batch',
        HarvesterPushIndicatorValuesBatch.as_view(),
        name='harvester-upload-values-batch-api'
    ),
    url(
        r'^upload',
        HarvesterPushIndicatorValues.as_view(),
        name='harvester-upload-values-api'
    ),
    url(
        r'^',
        HarvesterDetailAPI.as_view(),
        name='harvester-detail-api'
    ),
]
api = [
    url(
        r'^list',
        HarvesterListAPI.as_view(), name='harvester-list-api'
    ),
    url(
        r'^(?P<uuid>[0-9a-f-]+)/', include(harvester_api)
    ),
    url(r'^harvester-log/(?P<pk>\d+)',
        HarvesterLogData.as_view(),
        name='harvester-log-api'),
]

sharepoint = [
    url(
        r'^file/detail',
        SharepointFileDetail.as_view(), name='sharepoint-file-detail'
    ),
]

urlpatterns = [
    url(r'^api/', include(api)),
    url(r'^sharepoint/', include(sharepoint)),
    url(
        r'^vector-context-layer-harvester/test-data',
        VectorContextLayerTestConfiguration.as_view(),
        name='vector-context-layer-harvester-test-configuration'
    ),
]
