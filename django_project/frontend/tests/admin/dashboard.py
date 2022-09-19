"""Test for Dashboard admin view."""

import copy
import json

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from frontend.tests.admin._base import BaseViewTest
from geosight.data.models.dashboard import Dashboard
from geosight.permission.models.factory import PERMISSIONS

User = get_user_model()


class DashboardAdminViewTest(BaseViewTest, TestCase):
    """Test for Dashboard Admin."""

    list_url_tag = 'admin-dashboard-list-view'
    create_url_tag = 'admin-dashboard-create-view'
    edit_url_tag = 'admin-dashboard-edit-view'

    # payload
    data = {
        "referenceLayer": "AAAA",
        "indicatorLayers": [],
        "indicators": [],
        "basemapsLayers": [],
        "contextLayers": [],
        "extent": [
            0,
            0,
            0,
            0
        ],
        "widgets": [],
        "filters": {},
        "permission": {
            "organization_permission": "None",
            "public_permission": "None",
            "user_permissions": [],
            "group_permissions": [],
        }
    }

    @property
    def payload(self):
        """Return payload."""
        return {
            'name': 'name',
            'data': json.dumps(self.data)
        }

    def create_resource(self, user):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name='name'
        )

    def get_resources(self, user):
        """Create resource function."""
        return Dashboard.permissions.list(user).order_by('id')

    def test_create_view(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # POST it
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        self.assertRequestPostView(url, 302, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 302, new_payload, self.creator)
        new_resource = self.get_resources(self.creator).last()
        self.assertEqual(new_resource.name, new_payload['name'])
        self.assertEqual(new_resource.creator, self.creator)

        # Check the edit permission
        url = reverse(self.edit_url_tag, kwargs={'slug': new_resource.slug})
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_edit_view(self):
        """Test for edit view."""
        url = reverse(self.edit_url_tag, kwargs={'slug': 'test'})
        self.assertRequestGetView(url, 404)  # Resource not found

        url = reverse(self.edit_url_tag, kwargs={'slug': self.resource.slug})
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        # sharing
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.permission.update_user_permission(
            self.creator, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 200, self.creator)  # Creator

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.contributor_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.contributor_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

        # POST it
        new_payload = copy.deepcopy(self.payload)
        new_payload['name'] = 'name 1'
        self.assertRequestPostView(url, 403, new_payload)
        self.assertRequestPostView(url, 403, new_payload, self.viewer)
        self.assertRequestPostView(url, 403, new_payload, self.contributor)

        self.assertRequestPostView(url, 302, new_payload, self.creator)
        self.resource.refresh_from_db()
        self.assertEqual(self.resource.name, new_payload['name'])
        self.assertEqual(self.resource.creator, self.resource_creator)

    def test_detail_view(self):
        """Test for create view."""
        url = reverse(
            'dashboard-detail-view', kwargs={'slug': self.resource.slug})
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        self.permission.organization_permission = PERMISSIONS.READ.name
        self.permission.save()
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertRequestGetView(url, 200, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        self.permission.public_permission = PERMISSIONS.READ.name
        self.permission.save()
        self.assertRequestGetView(url, 200)  # Non login
        self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertRequestGetView(url, 200, self.contributor)  # Contributor
        self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin
