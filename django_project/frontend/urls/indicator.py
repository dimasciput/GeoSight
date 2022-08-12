"""Indicators urls."""
from django.conf.urls import url
from django.urls import include

from frontend.views.admin.indicator.create import IndicatorCreateView
from frontend.views.admin.indicator.edit import IndicatorEditView
from frontend.views.admin.indicator.list import IndicatorListView
from frontend.views.admin.indicator.value_management import (
    IndicatorValueManagementMapView, IndicatorValueManagementTableView
)
from frontend.views.admin.indicator.values import IndicatorValueListView

admin_indicator_detail_url = [
    url(
        r'^edit',
        IndicatorEditView.as_view(),
        name='admin-indicator-edit-view'
    ),
    url(
        r'^value-list$',
        IndicatorValueListView.as_view(),
        name='admin-indicator-value-list-manager'
    ),
    url(
        r'^value-manager-map$',
        IndicatorValueManagementMapView.as_view(),
        name='admin-indicator-value-mapview-manager'
    ),
    url(
        r'^value-manager-form',
        IndicatorValueManagementTableView.as_view(),
        name='admin-indicator-value-form-manager'
    ),
]
urlpatterns = [
    url(r'^(?P<pk>\d+)/', include(admin_indicator_detail_url)),
    url(
        r'^create',
        IndicatorCreateView.as_view(),
        name='admin-indicator-create-view'
    ),
    url(
        r'^',
        IndicatorListView.as_view(),
        name='admin-indicator-list-view'
    ),
]
