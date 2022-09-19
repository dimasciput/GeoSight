"""API for detail of group permission."""
import json

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models import Indicator
from geosight.georepo.models import ReferenceLayer, ReferenceLayerIndicator
from geosight.permission.access import RoleSuperAdminRequiredMixin
from geosight.permission.models import (
    ReferenceLayerIndicatorPermission,
    ReferenceLayerIndicatorUserPermission,
    ReferenceLayerIndicatorGroupPermission
)

User = get_user_model()


class DatasetAccessAPI(RoleSuperAdminRequiredMixin, APIView):
    """API for list of group."""

    def get(self, request):
        """Return permission data of group.

        Returning all or resources and also the permission.
        On resources, it is list of [id, name].
        On permissions, it is {d,i,u,p}.
        d = dataset id
        i = indicator id
        u = user id
        p = permission
        """
        user_permissions = []
        for ref in ReferenceLayerIndicatorPermission.objects.all():
            for permission in ref.user_permissions.all():
                user_permissions.append({
                    'd': ref.obj.reference_layer.id,
                    'dn': ref.obj.reference_layer.name,
                    'i': ref.obj.indicator.id,
                    'in': ref.obj.indicator.name,
                    'o': permission.user.id,
                    'on': permission.user.username,
                    'or': permission.user.profile.role,
                    'p': permission.permission
                })
        group_permissions = []
        for ref in ReferenceLayerIndicatorPermission.objects.all():
            for permission in ref.group_permissions.all():
                group_permissions.append({
                    'd': ref.obj.reference_layer.id,
                    'dn': ref.obj.reference_layer.name,
                    'i': ref.obj.indicator.id,
                    'in': ref.obj.indicator.name,
                    'o': permission.group.id,
                    'on': permission.group.name,
                    'p': permission.permission
                })
        general_permissions_dict = {}
        for ref in ReferenceLayerIndicatorPermission.objects.all():
            id = f'{ref.obj.reference_layer.id}-{ref.obj.indicator.id}'
            general_permissions_dict[id] = {
                'd': ref.obj.reference_layer.id,
                'dn': ref.obj.reference_layer.name,
                'i': ref.obj.indicator.id,
                'in': ref.obj.indicator.name,
                'o': ref.organization_permission,
                'p': ref.public_permission
            }

        general_permissions = []
        for indicator in Indicator.objects.all():
            for reference_layer in ReferenceLayer.objects.all():
                id = f'{reference_layer.id}-{indicator.id}'
                try:
                    general_permissions.append(general_permissions_dict[id])
                except KeyError:
                    ref = ReferenceLayerIndicatorPermission(
                        obj=ReferenceLayerIndicator(
                            reference_layer=reference_layer,
                            indicator=indicator
                        )
                    )
                    general_permissions.append({
                        'd': ref.obj.reference_layer.id,
                        'dn': ref.obj.reference_layer.name,
                        'i': ref.obj.indicator.id,
                        'in': ref.obj.indicator.__str__(),
                        'o': ref.organization_permission,
                        'p': ref.public_permission
                    })

        # Get permission choices
        obj = ReferenceLayerIndicatorPermission()
        org_perm_choices = obj.get_organization_permission_display.keywords[
            'field'].choices

        return Response(
            {
                'permissions': {
                    'users': user_permissions,
                    'groups': group_permissions,
                    'generals': general_permissions
                },
                'permission_choices': org_perm_choices
            }
        )

    def post(self, request):
        """Post permission of dataset."""
        data = json.loads(request.data['data'])

        permission_ids = []
        for permission in data['generals']:
            ref, created = ReferenceLayerIndicator.objects.get_or_create(
                reference_layer_id=permission['d'],
                indicator_id=permission['i']
            )
            obj, created = \
                ReferenceLayerIndicatorPermission.objects.get_or_create(
                    obj=ref)
            obj.organization_permission = permission['o']
            obj.public_permission = permission['p']
            obj.save()
            permission_ids.append(obj.id)

            # Save users
            obj.user_permissions.all().delete()
            for perm in data['users']:
                if permission['d'] == perm['d'] and \
                        permission['i'] == perm['i']:
                    ReferenceLayerIndicatorUserPermission.objects.create(
                        obj=obj,
                        user_id=perm['o'],
                        permission=perm['p']
                    )

            # Save groups
            obj.group_permissions.all().delete()
            for perm in data['groups']:
                if permission['d'] == perm['d'] and \
                        permission['i'] == perm['i']:
                    ReferenceLayerIndicatorGroupPermission.objects.create(
                        obj=obj,
                        group_id=perm['o'],
                        permission=perm['p']
                    )
        ReferenceLayerIndicatorPermission.objects.exclude(
            id__in=permission_ids).delete()

        return Response('OK')
