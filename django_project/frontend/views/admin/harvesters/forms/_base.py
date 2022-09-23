"""Harvester base."""
import json
from abc import ABC

from django.http import HttpResponseBadRequest
from django.shortcuts import reverse, get_object_or_404, redirect
from django.utils.module_loading import import_string

from frontend.views._base import BaseView
from geosight.data.models import Indicator
from geosight.georepo.models import ReferenceLayer
from geosight.harvester.models import (
    HARVESTERS, Harvester, HarvesterAttribute, HarvesterMappingValue
)
from geosight.harvester.serializer.harvester import HarvesterSerializer
from geosight.permission.access import (
    RoleCreatorRequiredMixin,
    edit_permission_resource
)


class HarvesterFormView(RoleCreatorRequiredMixin, BaseView, ABC):
    """HarvesterForm Base View."""

    indicator = None
    harvester_class = None

    @staticmethod
    def get_url_create_name(harvester_class):
        """Return url create name."""
        return harvester_class + '.create'

    @staticmethod
    def get_url_edit_name(harvester_class):
        """Return url edit name."""
        return harvester_class + '.edit'

    @property
    def url_create_name(self):
        """Return url create name."""
        return HarvesterFormView.get_url_create_name(
            str(self.harvester_class).split("'")[1]
        )

    @property
    def url_edit_name(self):
        """Return url edit name."""
        return HarvesterFormView.get_url_edit_name(
            str(self.harvester_class).split("'")[1]
        )

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Harvester'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-harvester-list-view')
        class_name = str(self.harvester_class).split("'")[1]
        harvester = Harvester(harvester_class=class_name)
        return (
            f'<a href="{list_url}">Harvesters</a> '
            f'<span>></span> '
            f'{harvester.harvester_name}'
        )

    def get_harvester(self) -> Harvester:
        """Return harvester."""
        uuid = self.kwargs.get('uuid', None)
        if uuid:
            return get_object_or_404(
                Harvester, unique_id=uuid
            )
        if not uuid:
            raise Harvester.DoesNotExist()

    @property
    def harvesters(self) -> list:
        """Return harvesters."""
        return HARVESTERS

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context.update(self.context_data(**kwargs))
        context['harvesters'] = json.dumps(context['harvesters'])
        context['harvester'] = json.dumps(context['harvester'])
        context['attributes'] = json.dumps(context['attributes'])
        context['mapping'] = json.dumps(context['mapping'])
        return context

    def context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = {}
        attributes = []
        mapping = []
        harvester = None
        try:
            harvester = self.get_harvester()
            edit_permission_resource(harvester, self.request.user)
            for _map in harvester.harvestermappingvalue_set.order_by(
                    'remote_value'
            ):
                mapping.append(
                    {
                        'remote_value': _map.remote_value,
                        'platform_value': _map.platform_value
                    }
                )
        except Harvester.DoesNotExist:
            pass

        harvester_class = str(self.harvester_class).split("'")[1]
        for name, attr in self.harvester_class.additional_attributes().items():
            value = attr.get('value', '')
            try:
                if name != 'API URL' and harvester:
                    value = harvester.harvesterattribute_set.get(
                        name=name
                    ).value
                    try:
                        value = value.replace('"', "'")
                    except ValueError:
                        pass
            except HarvesterAttribute.DoesNotExist:
                pass

            attributes.append(
                {
                    'name': name,
                    'title': attr.get('title', name).replace(
                        '_', ' ').capitalize(),
                    'value': value if value else '',
                    'description': attr.get('description', ''),
                    'required': attr.get('required', True),
                    'type': attr.get('type', ''),
                    'class': attr.get('class', ''),
                    'data': attr.get('data', {}),
                    'read_only': attr.get('read_only', False),
                }
            )
        context.update(
            {
                'indicator': harvester.indicator if harvester else None,
                'harvesters': [
                    {
                        'name': HarvesterClass[1],
                        'value': HarvesterClass[0],
                        'description': import_string(
                            HarvesterClass[0]
                        ).description,
                        'url': reverse(
                            HarvesterFormView.get_url_edit_name(
                                HarvesterClass[0]
                            ), args=[harvester.unique_id]
                        ) if harvester else reverse(
                            HarvesterFormView.get_url_create_name(
                                HarvesterClass[0]
                            )
                        )
                    } for HarvesterClass in self.harvesters
                ],
                'harvester_class': harvester_class,
                'harvester': HarvesterSerializer(
                    harvester
                ).data if harvester else {},
                'attributes': attributes,
                'mapping': mapping
            }
        )
        return context

    def post(self, request, **kwargs):
        """POST save harvester."""
        try:
            data = request.POST.copy()
            if not data.get('reference_layer', None):
                return HttpResponseBadRequest('Reference layer is required')

            if data.get('admin_level', None) is None:
                return HttpResponseBadRequest('Admin level is required')

            reference_layer, created = ReferenceLayer.objects.get_or_create(
                identifier=data.get('reference_layer', None)
            )
            data['attribute_extra_columns'] = ','.join(
                request.POST.getlist('attribute_extra_columns')
            )
            data['attribute_extra_keys'] = ','.join(
                request.POST.getlist('attribute_extra_keys')
            )
            indicator = data.get('indicator', None)
            if indicator:
                try:
                    indicator = Indicator.objects.get(id=indicator)
                except Indicator.DoesNotExist:
                    return HttpResponseBadRequest('Indicator is not found')

            harvester_class = data['harvester']
            try:
                harvester = self.get_harvester()
                edit_permission_resource(harvester, self.request.user)
            except Harvester.DoesNotExist:
                harvester = Harvester.objects.create(
                    harvester_class=harvester_class,
                    reference_layer=reference_layer,
                    indicator=indicator,
                    admin_level=data.get('admin_level', None),
                    creator=self.request.user
                )

            harvester.harvesterattribute_set.all().delete()
            harvester.harvestermappingvalue_set.all().delete()

            harvester.harvester_class = harvester_class
            if data.get('frequency', None):
                harvester.frequency = data.get('frequency')
            harvester.indicator = indicator
            harvester.reference_layer = reference_layer
            harvester.admin_level = data.get('admin_level', None)
            harvester.save()

            for key, value in data.items():
                if value:
                    if 'attribute_' in key:
                        try:
                            attribute = harvester.harvesterattribute_set.get(
                                name=key.replace('attribute_', '')
                            )
                            attribute.value = value
                            attribute.save()
                        except HarvesterAttribute.DoesNotExist:
                            pass
                    if 'mapping_remote_' in key:
                        try:
                            mapping_id = key.replace('mapping_remote_', '')
                            mapping_remote = value
                            mapping_platform = data[
                                'mapping_platform_' + mapping_id]
                            HarvesterMappingValue.objects.get_or_create(
                                harvester=harvester,
                                remote_value=mapping_remote,
                                defaults={
                                    'platform_value': mapping_platform
                                }
                            )
                        except KeyError:
                            pass

            # this is for files
            for key, _file in request.FILES.items():
                if _file:
                    if 'attribute_' in key:
                        try:
                            attribute = harvester.harvesterattribute_set.get(
                                name=key.replace('attribute_', '')
                            )
                            attribute.file = _file
                            attribute.save()
                        except HarvesterAttribute.DoesNotExist:
                            pass

            self.after_post(harvester)
            return redirect(
                reverse(
                    'harvester-detail-view', args=[
                        str(harvester.unique_id)
                    ]
                )
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required')

    def after_post(self, harvester: Harvester):
        """For calling after post success."""
        harvester.creator = self.request.user
        harvester.save()
