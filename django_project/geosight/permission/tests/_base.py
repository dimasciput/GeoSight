"""Test for Basemap admin view."""

from django.contrib.auth import get_user_model
from django.test import Client

from core.models.profile import ROLES
from core.tests.model_factories import GroupF, create_user

User = get_user_model()


class BasePermissionTest:
    """Test for Base Permission."""

    password = 'password'

    def create_resource(self, user):
        """Create resource function."""
        raise NotImplemented

    def get_resources(self, user):
        """Create resource function."""
        raise NotImplemented

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
        self.permission = self.resource.permission

        # Creating group
        self.group = GroupF()
        self.viewer_in_group = create_user(ROLES.VIEWER.name)
        self.viewer_in_group.groups.add(self.group)
        self.contributor_in_group = create_user(ROLES.CONTRIBUTOR.name)
        self.contributor_in_group.groups.add(self.group)
        self.creator_in_group = create_user(ROLES.CREATOR.name)
        self.creator_in_group.groups.add(self.group)

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestPostView(self, url, code, data, user=None):
        """Assert request POST view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.post(url, data=data)
        self.assertEquals(response.status_code, code)
        return response

    def assertRequestDeleteView(self, url, code, user=None):
        """Assert request DELETE view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.delete(url)
        self.assertEquals(response.status_code, code)
        return response
