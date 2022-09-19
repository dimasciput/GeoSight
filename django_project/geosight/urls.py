"""GeoSight urls."""
from django.conf.urls import url
from django.urls import include

urlpatterns = [
    url(r'^harvester/', include('geosight.harvester.urls')),
    url(r'^georepo/', include('geosight.georepo.urls')),
    url(r'^', include('geosight.data.urls')),
]
