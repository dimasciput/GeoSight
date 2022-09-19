"""GeoSight Data urls."""
from django.conf.urls import url
from django.urls import include

from dashboard.views.backups import BackupsView
from geosight.data.api.basemap import (
    BasemapListAPI, BasemapDetailAPI
)
from geosight.data.api.context_layers import (
    ContextLayerListAPI, ContextLayerDetailAPI
)
from geosight.data.api.dashboard import (
    DashboardData, DashboardDetail, DashboardListAPI,
    DashboardIndicatorValuesAPI
)
from geosight.data.api.dashboard_bookmark import (
    DashboardBookmarkAPI,
    DashboardBookmarkCreateAPI,
    DashboardBookmarkDetailAPI
)
from geosight.data.api.download_file import (
    DownloadSharepointFile,
    DownloadBackupsFile
)
from geosight.data.api.indicator import (
    IndicatorListAPI, IndicatorAdminListAPI,
    IndicatorDetailAPI, IndicatorValuesAPI
)
from geosight.data.api.indicator_value import (
    IndicatorValuesByGeometry,
    IndicatorValueDetail,
    IndicatorValueListAPI
)

# ------------------------------------------------------
dashboard_specific_api = [
    url(
        r'^data$',
        DashboardData.as_view(),
        name='dashboard-data-api'
    ),
    url(
        r'^$',
        DashboardDetail.as_view(),
        name='dashboard-detail-api'
    ),
    url(
        r'^indicator/(?P<pk>\d+)/values/latest',
        DashboardIndicatorValuesAPI.as_view(),
        name='dashboard-indicator-values-api'
    ),
    url(
        r'^bookmarks/create',
        DashboardBookmarkCreateAPI.as_view(),
        name='dashboard-bookmarks-create'
    ),
    url(
        r'^bookmarks/(?P<pk>\d+)',
        DashboardBookmarkDetailAPI.as_view(),
        name='dashboard-bookmarks-edit'
    ),
    url(
        r'^bookmarks',
        DashboardBookmarkAPI.as_view(),
        name='dashboard-bookmarks'
    ),
]
# DASHBOARD API
dashboard_api = [
    url(
        r'^list',
        DashboardListAPI.as_view(), name='dashboard-list-api'
    ),
    url(r'^(?P<slug>[^/]+)/', include(dashboard_specific_api)),
]
# ------------------------------------------------------
# INDICATOR API
indicator_api = [
    url(
        r'^list/basic',
        IndicatorAdminListAPI.as_view(), name='indicator-basic-list-api'
    ),
    url(
        r'^list/admin',
        IndicatorAdminListAPI.as_view(), name='indicator-admin-list-api'
    ),
    url(
        r'^list',
        IndicatorListAPI.as_view(), name='indicator-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/values/latest',
        IndicatorValuesAPI.as_view(), name='indicator-values-api'
    ),
    url(
        r'^(?P<pk>\d+)/values/list',
        IndicatorValueListAPI.as_view(), name='indicator-values-list-api'
    ),
    url(
        r'^(?P<pk>\d+)/values/by-geometry/(?P<geometry_code>.+)$',
        IndicatorValuesByGeometry.as_view(),
        name='indicator-values-by-geometry'
    ),
    url(
        r'^(?P<pk>\d+)/values/(?P<value_id>\d+)/details$',
        IndicatorValueDetail.as_view(),
        name='indicator-value-detail'
    ),
    url(
        r'^(?P<pk>\d+)/detail',
        IndicatorDetailAPI.as_view(), name='indicator-detail-api'
    ),
]
# ------------------------------------------------------
# BASEMAP API
basemap_api = [
    url(
        r'^list',
        BasemapListAPI.as_view(), name='basemap-list-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        BasemapDetailAPI.as_view(), name='basemap-detail-api'
    ),
]
# ------------------------------------------------------
# CONTEXT LAYER API
context_layer_api = [
    url(
        r'^list',
        ContextLayerListAPI.as_view(), name='context-layer-list-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        ContextLayerDetailAPI.as_view(), name='context-layer-detail-api'
    ),
]
# ------------------------------------------------------
api = [
    url(r'^dashboard/', include(dashboard_api)),
    url(r'^basemap/', include(basemap_api)),
    url(r'^indicator/', include(indicator_api)),
    url(r'^context-layer/', include(context_layer_api)),
    url(r'^permission/', include('geosight.permission.urls')),
]

download = [
    url(
        r'^sharepoint',
        DownloadSharepointFile.as_view(),
        name='download-sharepoint'
    ),
    url(
        r'^backups',
        DownloadBackupsFile.as_view(),
        name='download-backups'
    ),
]
urlpatterns = [
    url(r'^backups', BackupsView.as_view(), name='backups-view'),
    url(r'^download/', include(download)),
    url(r'^api/', include(api)),
    url(r'^', include('dashboard.urls')),
]
