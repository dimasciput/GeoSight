"""Test for Dashboard detail api."""

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from geosight.data.models.dashboard import Dashboard
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardListApiTest(BasePermissionTest, TestCase):
    """Test for context list api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name=name
        )

    def get_resources(self, user):
        """Create resource function."""
        return Dashboard.permissions.list(user).order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('dashboard-list-api')
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
        resource = self.create_resource(self.creator, 'name 2')
        url = reverse('dashboard-detail-api', kwargs={'slug': resource.slug})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('dashboard-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('dashboard-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)
