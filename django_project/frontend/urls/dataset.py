"""Dataset urls."""
from django.conf.urls import url

from frontend.views.admin.dataset.data_access import DataAccessAdminView

urlpatterns = [
    url(
        r'data-access',
        DataAccessAdminView.as_view(),
        name='admin-data-access-view'
    ),
]
