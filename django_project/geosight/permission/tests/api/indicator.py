"""Test for Indicator permission api."""

import copy

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from geosight.data.models.indicator import Indicator, AggregationMethod
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class IndicatorPermissionApiTest(BasePermissionTest, TestCase):
    """Test for context layer list api."""

    payload = {
        'name': 'name',
        'group': 'group',
        'aggregation_method': AggregationMethod.SUM
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

    def test_get_api(self):
        """Test get permission API."""
        url = reverse(
            'indicator-permission-api', kwargs={'pk': self.resource.id})

        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 403, self.creator)
        self.assertRequestGetView(url, 200, self.resource_creator)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.SHARE.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)
