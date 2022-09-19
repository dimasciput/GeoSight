"""GeoSight Permission urls."""
from django.conf.urls import url

from geosight.permission.api import (
    BasemapPermissionAPI,
    ContextLayerPermissionAPI,
    DashboardPermissionAPI,
    GroupPermissionAPI,
    HarvesterPermissionAPI,
    IndicatorPermissionAPI,
    DatasetAccessAPI
)

urlpatterns = [
    url(
        r'^basemap/(?P<pk>\d+)',
        BasemapPermissionAPI.as_view(),
        name='basemap-permission-api'
    ),
    url(
        r'^context-layer/(?P<pk>\d+)',
        ContextLayerPermissionAPI.as_view(),
        name='context-layer-permission-api'
    ),
    url(
        r'^dashboard/(?P<slug>[^/]+)',
        DashboardPermissionAPI.as_view(),
        name='dashboard-permission-api'
    ),
    url(
        r'^group/(?P<pk>\d+)',
        GroupPermissionAPI.as_view(),
        name='group-permission-api'
    ),
    url(
        r'^harvester/(?P<uuid>[0-9a-f-]+)',
        HarvesterPermissionAPI.as_view(),
        name='harvester-permission-api'
    ),
    url(
        r'^indicator/(?P<pk>\d+)',
        IndicatorPermissionAPI.as_view(),
        name='indicator-permission-api'
    ),
    url(
        r'^dataset/data-access',
        DatasetAccessAPI.as_view(),
        name='dataset-access-api'
    ),
]
