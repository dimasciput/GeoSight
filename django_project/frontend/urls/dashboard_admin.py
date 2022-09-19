"""Dashboard urls."""
from django.conf.urls import url

from frontend.views.admin.dashboard.list import DashboardListView
from frontend.views.admin.dashboard.create import DashboardCreateView
from frontend.views.admin.dashboard.edit import DashboardEditView

urlpatterns = [
    url(
        r'^create',
        DashboardCreateView.as_view(),
        name='admin-dashboard-create-view'
    ),
    url(
        r'^(?P<slug>[^/]+)/edit',
        DashboardEditView.as_view(),
        name='admin-dashboard-edit-view'
    ),
    url(
        r'^',
        DashboardListView.as_view(),
        name='admin-dashboard-list-view'
    ),
]
