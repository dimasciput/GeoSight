"""Test for User admin view."""

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase
from django.urls import reverse

from core.models.profile import ROLES
from core.tests.model_factories import create_user
from frontend.tests.admin._base import BaseViewTest

User = get_user_model()


class UserAdminViewTest(BaseViewTest, TestCase):
    """Test for User Admin."""

    list_url_tag = 'admin-user-list-view'
    create_url_tag = 'admin-user-create-view'
    edit_url_tag = 'admin-user-edit-view'

    def setUp(self):
        """To setup test."""
        self.admin = create_user(
            ROLES.SUPER_ADMIN.name, password=self.password)
        self.creator = create_user(
            ROLES.CREATOR.name, password=self.password)
        self.contributor = create_user(
            ROLES.CONTRIBUTOR.name, password=self.password)
        self.viewer = create_user(
            ROLES.VIEWER.name, password=self.password)
        self.resource_creator = create_user(ROLES.CREATOR.name)

        # Resource layer attribute
        self.resource = self.create_resource(self.resource_creator)

    def create_resource(self, user):
        """Create resource function."""
        return create_user(
            ROLES.VIEWER.name, password=self.password)

    def get_resources(self, user):
        """Create resource function."""
        return User.objects.all()

    def test_list_view(self):
        """Test for list view."""
        url = reverse(self.list_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_create_view(self):
        """Test for create view."""
        url = reverse(self.create_url_tag)
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

    def test_edit_view(self):
        """Test for edit view."""
        url = reverse(self.edit_url_tag, kwargs={'username': 'username'})
        self.assertRequestGetView(url, 302)  # Resource not found

        url = reverse(
            self.edit_url_tag, kwargs={'username': self.resource.username})
        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)  # Contributor
        self.assertRequestGetView(url, 403, self.creator)  # Creator
        self.assertRequestGetView(url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin
