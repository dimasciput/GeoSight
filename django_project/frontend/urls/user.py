"""User urls."""
from django.conf.urls import url
from django.urls import include

from frontend.views.admin.user.create import UserCreateView
from frontend.views.admin.user.edit import UserEditView
from frontend.views.admin.user.list import UserListView

admin_detail_url = [
    url(
        r'^edit',
        UserEditView.as_view(),
        name='admin-user-edit-view'
    ),
]
urlpatterns = [
    url(r'^(?P<username>\w+)/', include(admin_detail_url)),
    url(
        r'^create',
        UserCreateView.as_view(),
        name='admin-user-create-view'
    ),
    url(
        r'^',
        UserListView.as_view(),
        name='admin-user-list-view'
    ),
]
