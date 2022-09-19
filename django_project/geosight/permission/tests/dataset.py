"""Test for Dataset permission."""

from django.contrib.auth import get_user_model
from django.test.testcases import TestCase

from core.models.profile import ROLES
from core.tests.model_factories import GroupF, create_user
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayer
from geosight.georepo.models.reference_layer import ReferenceLayerIndicator
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.manager import PermissionException

User = get_user_model()


class DatasetPermissionTest(TestCase):
    """Test for Permission Test."""

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

    def assert_permissions(
            self,
            user: User,
            assert_list: bool,
            assert_read: bool,
            assert_edit: bool,
            assert_share: bool,
            assert_delete: bool
    ):
        """Assert all permissions."""
        self.assertEqual(self.permission.has_list_perm(user), assert_list)
        self.assertEqual(self.permission.has_read_perm(user), assert_read)
        self.assertEqual(self.permission.has_edit_perm(user), assert_edit)
        self.assertEqual(self.permission.has_share_perm(user), assert_share)
        self.assertEqual(self.permission.has_delete_perm(user), assert_delete)

    def test_creation(self):
        """Test creation of resource.

        Just admin and creator can do the action.
        """
        self.create_resource('identifier 2', self.admin)
        self.create_resource('identifier 3', self.creator)
        with self.assertRaises(PermissionException):
            self.create_resource('identifier 4', self.contributor)
        with self.assertRaises(PermissionException):
            self.create_resource('identifier 5', self.viewer)

    def test_list(self):
        """Test list of resource."""
        creator = create_user(ROLES.CREATOR.name)
        resource_1 = self.create_resource('identifier 6', creator)
        resource_1.permission.organization_permission = PERMISSIONS.NONE
        resource_1.permission.save()
        resource_2 = self.create_resource('identifier 7', creator)
        resource_2.permission.organization_permission = PERMISSIONS.NONE
        resource_2.permission.save()

        creator_2 = create_user(ROLES.CREATOR.name)
        resource_3 = self.create_resource('identifier 8', creator_2)
        resource_3.permission.organization_permission = PERMISSIONS.NONE
        resource_3.permission.save()

        self.assertEqual(self.get_resources(self.admin).count(), 4)
        self.assertEqual(self.get_resources(creator).count(), 2)
        self.assertEqual(self.get_resources(self.contributor).count(), 0)
        self.assertEqual(self.get_resources(self.viewer).count(), 0)
        self.assertEqual(self.get_resources(None).count(), 0)

        resource_3.permission.update_user_permission(creator, PERMISSIONS.LIST)
        self.assertEqual(self.get_resources(creator).count(), 3)

        resource_2.permission.update_user_permission(
            self.contributor, PERMISSIONS.LIST)
        resource_3.permission.update_user_permission(
            self.contributor, PERMISSIONS.LIST)
        self.assertEqual(self.get_resources(self.contributor).count(), 2)

        self.assertEqual(self.get_resources(self.viewer_in_group).count(), 0)
        resource_3.permission.update_group_permission(
            self.group, PERMISSIONS.LIST)
        self.assertEqual(self.get_resources(self.viewer_in_group).count(), 1)

    def test_admin_layer_permission(self):
        """Check admin permission."""
        user = self.admin
        self.assert_permissions(user, True, True, True, True, True)

    def test_creator_layer_permission(self):
        """Check creator layer permission."""
        user = self.resource_creator
        self.assertEqual(self.resource.creator, user)
        self.assert_permissions(user, True, True, True, True, True)

    def test_creator_permission(self):
        """Check creator permission."""
        user = self.creator
        self.assert_permissions(user, False, False, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as share
        self.permission.update_user_permission(user, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, True, True, False)

        # Assign as delete
        self.permission.update_user_permission(user, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, True, True, True)

    def test_contributor_permission(self):
        """Check contributor permission."""
        user = self.contributor
        self.assert_permissions(user, False, False, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as share
        self.permission.update_user_permission(user, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, True, False, False)

        # Assign as delete
        self.permission.update_user_permission(user, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, True, False, False)

    def test_viewer_permission(self):
        """Check viewer permission."""
        user = self.viewer
        self.assert_permissions(user, False, False, False, False, False)

        # Assign as list
        self.permission.update_user_permission(user, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_user_permission(user, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_user_permission(user, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as share
        self.permission.update_user_permission(user, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as delete
        self.permission.update_user_permission(user, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, False, False, False)

    def test_viewer_in_group_permission(self):
        """Check viewer in group permission."""
        user = self.viewer_in_group
        self.assert_permissions(user, False, False, False, False, False)

        # Assign as list
        self.permission.update_group_permission(
            self.group, PERMISSIONS.LIST.name)
        self.assert_permissions(user, True, False, False, False, False)

        # Assign as read
        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as write
        self.permission.update_group_permission(
            self.group, PERMISSIONS.WRITE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as share
        self.permission.update_group_permission(
            self.group, PERMISSIONS.SHARE.name)
        self.assert_permissions(user, True, True, False, False, False)

        # Assign as delete
        self.permission.update_group_permission(
            self.group, PERMISSIONS.OWNER.name)
        self.assert_permissions(user, True, True, False, False, False)

    def test_public_permission(self):
        """Check non user permission."""
        user = None
        self.assert_permissions(user, False, False, False, False, False)

        self.permission.public_permission = PERMISSIONS.READ.name
        self.permission.save()

        self.assert_permissions(user, True, True, False, False, False)
