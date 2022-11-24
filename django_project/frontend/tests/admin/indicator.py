"""Test for Indicator admin view."""

import copy

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.indicator import (
    Indicator, IndicatorType, AggregationMethod
)
from geosight.georepo.models.reference_layer import (
    ReferenceLayer, ReferenceLayerIndicator
)
from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()


class IndicatorAdminViewTest(BaseViewTest, TestCase):
    """Test for Indicator Admin."""

    list_url_tag = 'admin-indicator-list-view'
    create_url_tag = 'admin-indicator-create-view'
    edit_url_tag = 'admin-indicator-edit-view'
    payload = {
        'name': 'name',
        'group': 'group',
        'aggregation_method': AggregationMethod.SUM,
        'shortcode': 'SHORT',
        'type': IndicatorType.FLOAT
    }

    def create_resource(self, user):
        """Create resource function."""
        payload = copy.deepcopy(self.payload)
        del payload['group']
        return Indicator.permissions.create(
            user=user,
            **payload
        )

    def get_resources(self, user):
        """Create resource function."""
        return Indicator.permissions.list(user).order_by('id')

    def test_values_view(self):
        """Test for values view."""
        resource = self.create_resource(self.creator)

        url = reverse(
            'admin-indicator-value-list-manager', kwargs={'pk': resource.id})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        resource.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)

        resource.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

    def test_value_management_map_view(self):
        """Test for management map view."""
        resource = self.create_resource(self.creator)

        url = reverse(
            'admin-indicator-value-mapview-manager', kwargs={'pk': resource.id}
        )
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        resource.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)

        resource.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

    def test_value_management_table_view(self):
        """Test for management table view."""
        resource = self.create_resource(self.creator)

        url = reverse(
            'admin-indicator-value-form-manager', kwargs={'pk': resource.id}
        )
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        resource.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)

        resource.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

        # POST
        reference_layer, created = ReferenceLayer.objects.get_or_create(
            identifier='identifier'
        )
        payload = {
            'reference_layer': reference_layer.identifier
        }
        dataset, created = ReferenceLayerIndicator.objects.get_or_create(
            reference_layer=reference_layer,
            indicator=resource
        )
        self.assertRequestPostView(url, 302, payload)
        self.assertRequestPostView(url, 403, payload, self.viewer)
        self.assertRequestPostView(url, 403, payload, self.contributor)
        self.assertRequestPostView(url, 403, payload, self.resource_creator)
        self.assertRequestPostView(url, 302, payload, self.creator)
        self.assertRequestPostView(url, 302, payload, self.admin)

        # Sharing
        dataset.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestPostView(url, 403, payload, self.contributor)
        dataset.permission.update_user_permission(
            self.contributor, PERMISSIONS.WRITE.name)
        self.assertRequestPostView(url, 302, payload, self.contributor)

        dataset.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestPostView(url, 403, payload, self.viewer_in_group)
        self.assertRequestPostView(
            url, 403, payload, self.contributor_in_group)
        self.assertRequestPostView(url, 403, payload, self.creator_in_group)

        dataset.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assertRequestPostView(url, 403, payload, self.viewer_in_group)
        self.assertRequestPostView(
            url, 302, payload, self.contributor_in_group)
        self.assertRequestPostView(url, 302, payload, self.creator_in_group)
