"""Harvester urls."""
from django.conf.urls import url
from django.urls import include

from frontend.views.admin.data_importer import (
    DataImporterListView, DataImporterDetail
)
from frontend.views.admin.harvesters import (
    HarvestedUsingExposedAPIByExternalClientView,
    HarvesterDetail,
    HarvesterListView,
    MetaIngestorWideFormatForm, MetaIngestorLongFormatForm,

    # Harvester
    HarvesterAPIWithGeographyAndDateView,
    HarvesterAPIWithGeographyAndTodayDateView,
    SharepointHarvesterView,
    VectorContextLayerHarvesterView
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
        r'^sharepoint',
        SharepointHarvesterView.as_view(),
        name=SharepointHarvesterView().url_create_name
    ),
    url(
        r'^vector-context-layer',
        VectorContextLayerHarvesterView.as_view(),
        name=VectorContextLayerHarvesterView().url_create_name
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
        r'^sharepoint',
        SharepointHarvesterView.as_view(),
        name=SharepointHarvesterView().url_edit_name
    ),
    url(
        r'^vector-context-layer',
        VectorContextLayerHarvesterView.as_view(),
        name=VectorContextLayerHarvesterView().url_edit_name
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

data_importer_create_form_url = [
    url(
        r'^import-excel-wide-format',
        MetaIngestorWideFormatForm.as_view(),
        name=MetaIngestorWideFormatForm().url_create_name
    ),
    url(
        r'^import-excel-long-format',
        MetaIngestorLongFormatForm.as_view(),
        name=MetaIngestorLongFormatForm().url_create_name
    ),
]
data_importer_edit_form_url = [
    url(
        r'^import-excel-wide-format',
        MetaIngestorWideFormatForm.as_view(),
        name=MetaIngestorWideFormatForm().url_edit_name
    ),
    url(
        r'^import-excel-long-format',
        MetaIngestorLongFormatForm.as_view(),
        name=MetaIngestorLongFormatForm().url_edit_name
    ),
]
import_data_url = [
    url(
        r'^create/',
        include(data_importer_create_form_url)
    ),
    url(
        r'^(?P<uuid>[0-9a-f-]+)/edit/',
        include(data_importer_edit_form_url)),
    url(
        r'^(?P<uuid>[0-9a-f-]+)', DataImporterDetail.as_view(),
        name='data-importer-detail-view'
    ),
    url(
        r'^',
        DataImporterListView.as_view(),
        name='admin-data-importer-list-view'
    ),
]

urlpatterns = [
    url(r'^harvester/', include(harvester_url)),
    url(r'^data-importer/', include(import_data_url)),
]
