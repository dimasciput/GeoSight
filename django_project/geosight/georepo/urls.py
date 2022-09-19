"""GeoSight Permission urls."""
from django.conf.urls import url

from geosight.georepo.api import ReferenceLayerListAPI

urlpatterns = [
    url(
        r'^reference-layer',
        ReferenceLayerListAPI.as_view(),
        name='reference-layer-list-api'
    ),
]
