"""Group urls."""
from django.conf.urls import url
from django.urls import include

from frontend.views.admin.group.create import GroupCreateView
from frontend.views.admin.group.edit import GroupEditView
from frontend.views.admin.group.list import GroupListView

admin_detail_url = [
    url(
        r'^edit',
        GroupEditView.as_view(),
        name='admin-group-edit-view'
    ),
]
urlpatterns = [
    url(r'^(?P<pk>\d+)/', include(admin_detail_url)),
    url(
        r'^create',
        GroupCreateView.as_view(),
        name='admin-group-create-view'
    ),
    url(
        r'^',
        GroupListView.as_view(),
        name='admin-group-list-view'
    ),
]
