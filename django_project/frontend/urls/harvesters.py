"""Harvester urls."""
from django.conf.urls import url
from django.urls import include

from frontend.views.admin.harvesters import (
    HarvestedUsingExposedAPIByExternalClientView,
    HarvesterDetail, MetaIngestorForm, HarvesterListView,
    HarvesterAPIWithGeographyAndDateView,
    HarvesterAPIWithGeographyAndTodayDateView
)

harvester_create_form_url = [
    url(
        r'^api-with-geography-and-date',
        HarvesterAPIWithGeographyAndDateView.as_view(),
        name=HarvesterAPIWithGeographyAndDateView().url_create_name
    ),
    url(
        r'^api-with-geography',
        HarvesterAPIWithGeographyAndTodayDateView.as_view(),
        name=HarvesterAPIWithGeographyAndTodayDateView().url_create_name
    ),
    url(
        r'^exposed-api',
        HarvestedUsingExposedAPIByExternalClientView.as_view(),
        name=HarvestedUsingExposedAPIByExternalClientView().url_create_name
    ),
    url(
        r'^meta-ingestor',
        MetaIngestorForm.as_view(),
        name=MetaIngestorForm().url_create_name
    ),
]
harvester_edit_form_url = [
    url(
        r'^api-with-geography-and-date',
        HarvesterAPIWithGeographyAndDateView.as_view(),
        name=HarvesterAPIWithGeographyAndDateView().url_edit_name
    ),
    url(
        r'^api-with-geography',
        HarvesterAPIWithGeographyAndTodayDateView.as_view(),
        name=HarvesterAPIWithGeographyAndTodayDateView().url_edit_name
    ),
    url(
        r'^exposed-api',
        HarvestedUsingExposedAPIByExternalClientView.as_view(),
        name=HarvestedUsingExposedAPIByExternalClientView().url_edit_name
    ),
    url(
        r'^meta-ingestor',
        MetaIngestorForm.as_view(),
        name=MetaIngestorForm().url_edit_name
    ),
]
harvester_url = [
    url(
        r'^create/',
        include(harvester_create_form_url)
    ),
    url(
        r'^(?P<uuid>[0-9a-f-]+)/edit/',
        include(harvester_edit_form_url)),
    url(
        r'^(?P<uuid>[0-9a-f-]+)', HarvesterDetail.as_view(),
        name='harvester-detail-view'
    ),
    url(
        r'^',
        HarvesterListView.as_view(),
        name='admin-harvester-list-view'
    ),
]

urlpatterns = [
    url(r'^harvester/', include(harvester_url)),
]
