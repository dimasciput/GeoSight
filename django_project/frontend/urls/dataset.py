"""Dataset urls."""
from django.conf.urls import url

from frontend.views.admin.dataset.data_access import DataAccessAdminView
from frontend.views.admin.dataset.dataset import DatasetAdminView

urlpatterns = [
    url(
        r'data-access',
        DataAccessAdminView.as_view(),
        name='admin-data-access-view'
    ),
    url(
        r'dataset',
        DatasetAdminView.as_view(),
        name='admin-dataset-view'
    ),
]
