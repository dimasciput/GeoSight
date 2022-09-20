"""Test for Harvester detail api."""

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

User = get_user_model()
HarvesterUsed = HarvestedUsingExposedAPIByExternalClientView

User = get_user_model()


class HarvesterListApiTest(BasePermissionTest, TestCase):
    """Test for context list api."""

    @property
    def payload(self):
        """Return payload for push data."""
        reference_layer, created = ReferenceLayer.objects.get_or_create(
            identifier='identifier'
        )
        return {
            'harvester': UsingExposedAPI[0],
            'reference_layer': reference_layer.id,
            'admin_level': 1
        }

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

    def test_list_api(self):
        """Test list API."""
        url = reverse('harvester-list-api')
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()

        # Check the list returned
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.contributor)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(
            url, 200, self.resource_creator)  # Creator
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(url, 200, self.admin)  # Admin
        self.assertEqual(len(response.json()), 1)

        # sharing
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)
        response = self.assertRequestGetView(
            url, 200, self.contributor)  # Contributor
        self.assertEqual(len(response.json()), 1)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestGetView(url, 200, self.creator_in_group)
        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 1)

        self.permission.public_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 1)

        self.permission.organization_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200)  # Viewer
        self.assertEqual(len(response.json()), 1)

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator)
        url = reverse(
            'harvester-detail-api', kwargs={'uuid': resource.unique_id})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('harvester-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('harvester-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)
