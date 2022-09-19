"""This is contains all of permission default for all resource."""

from geosight.permission.models.factory import PERMISSIONS

ALL_PERMISSIONS = [
    (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
    (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
    (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
    (PERMISSIONS.SHARE.name, PERMISSIONS.SHARE.name),
    (PERMISSIONS.OWNER.name, PERMISSIONS.OWNER.name),
]


class PermissionDefaultDetail:
    """Class that has permission detail data."""

    def __init__(self, default: str, permissions: list):
        """Initiate permission default detail."""
        self.default = default
        self.permissions = permissions


class PermissionResourceDefault:
    """Permission default for resource."""

    def __init__(
            self,
            user: PermissionDefaultDetail,
            group: PermissionDefaultDetail,
            organization: PermissionDefaultDetail,
            public: PermissionDefaultDetail
    ):
        """Initiate permission default detail."""
        self.user = user
        self.group = group
        self.organization = organization
        self.public = public


class PermissionDefault:
    """Permission defaults for all resource."""

    # Dashboard
    DASHBOARD = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )
    # Indicator
    INDICATOR = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Context layer
    CONTEXT_LAYER = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Basemap
    BASEMAP = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Harvester
    HARVESTER = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            ]
        )
    )

    # Group
    GROUP = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            ]
        )
    )

    # Dataset
    DATASET = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        )
    )
