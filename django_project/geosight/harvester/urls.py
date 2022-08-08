"""GeoSight Harvester urls."""
from django.conf.urls import url
from django.urls import include

from geosight.harvester.api.harvester import (
    HarvesterLogData, HarvesterListAPI, HarvesterDetailAPI
)
from geosight.harvester.api.harvester_push_api import (
    HarvesterPushIndicatorValues, HarvesterPushIndicatorValuesBatch
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

urlpatterns = [
    url(r'^api/', include(api)),
]
