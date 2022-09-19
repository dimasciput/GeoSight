# coding=utf-8
"""Main django urls."""

from django.conf import settings
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic.base import RedirectView

from core.api.group import GroupListAPI, GroupDetailAPI
from core.api.proxy import ProxyView
from core.api.user import UserListAPI, UserDetailAPI

admin.autodiscover()

urlpatterns = [
    url(r'^django-admin/core/sitepreferences/$', RedirectView.as_view(
        url='/django-admin/core/sitepreferences/1/change/', permanent=False),
        name='index'),
    url(r'^django-admin/', admin.site.urls),
    url(r'^auth/', include('django.contrib.auth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# ------------------------------------------------------
# USER API
user_api = [
    url(
        r'^list',
        UserListAPI.as_view(), name='user-list-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        UserDetailAPI.as_view(), name='user-detail-api'
    ),
]
# GROUP API
group_api = [
    url(
        r'^list',
        GroupListAPI.as_view(), name='group-list-api'
    ),
    url(
        r'^(?P<pk>\d+)',
        GroupDetailAPI.as_view(), name='group-detail-api'
    ),
]

api = [
    url(r'^group/', include(group_api)),
    url(r'^user/', include(user_api)),
]
urlpatterns += [
    url(r'^proxy', ProxyView.as_view(), name='proxy-view'),
    url(r'^api/', include(api)),
    url(r'^', include('geosight.urls')),
    url(r'^', include('frontend.urls')),
]
