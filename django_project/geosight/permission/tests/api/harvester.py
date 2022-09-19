"""Test for Harvester permission api."""

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from frontend.views.admin.harvesters import (
    HarvestedUsingExposedAPIByExternalClientView
)
from geosight.georepo.models import ReferenceLayer
from geosight.harvester.models import Harvester, UsingExposedAPI
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

HarvesterUsed = HarvestedUsingExposedAPIByExternalClientView

User = get_user_model()


class HarvesterPermissionApiTest(BasePermissionTest, TestCase):
    """Test for context layer list api."""

    def create_resource(self, user):
        """Create resource function."""
        reference_layer, created = ReferenceLayer.objects.get_or_create(
            identifier='identifier'
        )
        return Harvester.permissions.create(
            user=user,
            harvester_class=UsingExposedAPI[0],
            reference_layer=reference_layer,
        )

    def get_resources(self, user):
        """Create resource function."""
        return Harvester.permissions.list(user).order_by('id')

    def test_get_api(self):
        """Test get permission API."""
        url = reverse(
            'harvester-permission-api',
            kwargs={'uuid': self.resource.unique_id})

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
