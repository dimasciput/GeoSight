"""Test for ContextLayer admin view."""

import copy

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.context_layer import ContextLayer, LayerType

User = get_user_model()


class ContextLayerAdminViewTest(BaseViewTest, TestCase):
    """Test for ContextLayer Admin."""

    list_url_tag = 'admin-context-layer-list-view'
    create_url_tag = 'admin-context-layer-create-view'
    edit_url_tag = 'admin-context-layer-edit-view'
    payload = {
        'name': 'name',
        'url': 'url',
        'layer_type': LayerType.ARCGIS,
        'group': 'group'
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return ContextLayer.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return ContextLayer.permissions.list(user).order_by('id')
