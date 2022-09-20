"""Test for Dataset permission."""

from django.contrib.auth import get_user_model
from django.test import Client
from django.test.testcases import TestCase
from django.urls import reverse

from core.models.profile import ROLES
from core.tests.model_factories import GroupF, create_user
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayer
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator

User = get_user_model()


class DatasetPermissionTest(TestCase):
    """Test for Permission Test."""

    password = 'password'

    def create_resource(self, name, user):
        """Create resource function."""
        indicator = Indicator.permissions.create(user=user, name=name)
        reference_layer = ReferenceLayer.objects.create(identifier=name)
        return ReferenceLayerIndicator.permissions.create(
            user=user,
            indicator=indicator,
            reference_layer=reference_layer
        )

    def get_resources(self, user):
        """Create resource function."""
        return ReferenceLayerIndicator.permissions.list(user)

    def setUp(self):
        """To setup test."""
        self.admin = create_user(ROLES.SUPER_ADMIN.name)
        self.creator = create_user(ROLES.CREATOR.name)
        self.contributor = create_user(ROLES.CONTRIBUTOR.name)
        self.viewer = create_user(ROLES.VIEWER.name)
        self.resource_creator = create_user(ROLES.CREATOR.name)

        self.group = GroupF()
        self.viewer_in_group = create_user(ROLES.VIEWER.name)
        self.viewer_in_group.groups.add(self.group)

        # Resource layer attribute
        self.resource = self.create_resource(
            'identifier 1',
            self.resource_creator
        )
        self.permission = self.resource.permission

    def assertRequestGetView(self, url, code, user=None):
        """Assert request GET view with code."""
        client = Client()
        if user:
            client.login(username=user.username, password=self.password)
        response = client.get(url)
        self.assertEquals(response.status_code, code)
        return response

    def test_get_api(self):
        """Test list of resource."""
        url = reverse('dataset-access-api')

        self.assertRequestGetView(url, 302)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 403, self.creator)
        self.assertRequestGetView(url, 403, self.resource_creator)
        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.admin)
