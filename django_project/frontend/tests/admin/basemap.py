"""Test for Basemap admin view."""

import copy

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.basemap_layer import BasemapLayer, BasemapLayerType

User = get_user_model()


class BasemapAdminViewTest(BaseViewTest, TestCase):
    """Test for Basemap Admin."""

    list_url_tag = 'admin-basemap-list-view'
    create_url_tag = 'admin-basemap-create-view'
    edit_url_tag = 'admin-basemap-edit-view'
    payload = {
        'name': 'name',
        'url': 'url',
        'type': BasemapLayerType.XYZ_TILE,
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return BasemapLayer.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return BasemapLayer.permissions.list(user).order_by('id')
