"""Dashboard model."""
import json

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.general import (
    SlugTerm, IconTerm, AbstractTerm, AbstractEditData
)
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayer
from geosight.permission.models.manager import PermissionManager

User = get_user_model()


class DashboardGroup(AbstractTerm):
    """The group of dashboard."""

    pass


class Dashboard(SlugTerm, IconTerm, AbstractEditData):
    """Dashboard model.

    One dashboard just contains one indicator.
    The instance is based on the indicator's.
    The administrative is based on the indicator's.

    Basemap layers and context layers is based on the indicator's instance.
    """

    reference_layer = models.ForeignKey(
        ReferenceLayer,
        help_text=_('Reference layer.'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    extent = models.PolygonField(
        blank=True, null=True,
        help_text=_(
            'Extent of the dashboard. If empty, it is the whole map'
        )
    )
    filters = models.TextField(
        blank=True, null=True
    )
    filters_allow_modify = models.BooleanField(
        default=False
    )

    # group
    group = models.ForeignKey(
        DashboardGroup,
        on_delete=models.SET_NULL,
        blank=True, null=True
    )
    objects = models.Manager()
    permissions = PermissionManager()

    def save_relations(self, data):
        from geosight.data.models.dashboard import DashboardRelationGroup
        """Save all relationship data."""
        from geosight.data.models.dashboard import (
            DashboardIndicator, DashboardIndicatorRule, DashboardBasemap,
            DashboardContextLayer, DashboardContextLayerField,
            DashboardIndicatorLayer, DashboardIndicatorLayerIndicator
        )
        self.permission.update(data['permission'])
        self.save_widgets(data['widgets'])

        # INDICATORS
        self.save_relation(
            DashboardIndicator, Indicator, self.dashboardindicator_set.all(),
            data['indicators'])
        # save rules
        for indicator in data['indicators']:
            try:
                dashboard_indicator = self.dashboardindicator_set.get(
                    object_id=indicator['id'])
                dashboard_indicator.dashboardindicatorrule_set.all().delete()
                for idx, rule in enumerate(indicator['rules']):
                    indicator_rule, created = \
                        DashboardIndicatorRule.objects.get_or_create(
                            object=dashboard_indicator,
                            name=rule['name']
                        )
                    indicator_rule.rule = rule['rule']
                    indicator_rule.color = rule['color']
                    indicator_rule.outline_color = rule['outline_color']
                    indicator_rule.active = rule['active']
                    indicator_rule.order = idx
                    indicator_rule.save()

            except DashboardIndicator.DoesNotExist:
                pass

        self.save_relation(
            DashboardBasemap, BasemapLayer, self.dashboardbasemap_set.all(),
            data['basemapsLayers'])

        # CONTEXT LAYERS
        self.save_relation(
            DashboardContextLayer, ContextLayer,
            self.dashboardcontextlayer_set.all(),
            data['contextLayers'])

        # Save fields
        for context_layer in data['contextLayers']:
            try:
                dashbaord_context_layer = self.dashboardcontextlayer_set.get(
                    object_id=context_layer['id'])
                dashbaord_context_layer.dashboardcontextlayerfield_set.all(

                ).delete()
                for idx, field in enumerate(context_layer['data_fields']):
                    DashboardContextLayerField.objects.get_or_create(
                        object=dashbaord_context_layer,
                        name=field['name'],
                        alias=field['alias'],
                        visible=field.get('visible', True),
                        as_label=field.get('as_label', False),
                        type=field.get('type', 'string'),
                        order=idx
                    )

            except DashboardContextLayer.DoesNotExist:
                pass

        # INDICATOR LAYERS
        ids = []
        indicatorLayers = data['indicatorLayers']
        for data in indicatorLayers:
            ids.append(data.get('id', 0))
        modelQuery = self.dashboardindicatorlayer_set.all()

        # Remove all not found ids
        modelQuery.exclude(id__in=ids).delete()

        for idx, data in enumerate(indicatorLayers):
            if not data['indicators']:
                continue

            try:
                model = modelQuery.get(
                    id=data.get('id', 0)
                )
            except (KeyError, DashboardIndicatorLayer.DoesNotExist):
                model = DashboardIndicatorLayer(
                    dashboard=self
                )
            model.order = data.get('order', idx)
            model.group = data.get('group', '')
            group, _ = DashboardRelationGroup.objects.get_or_create(
                name=data.get('group', '')
            )
            group_parent = data.get('group_parent', '')
            if group_parent:
                group_parent, _ = DashboardRelationGroup.objects.get_or_create(
                    name=data.get('group_parent')
                )
                group.group = group_parent
                if data.get('group_order', ''):
                    group.order = int(data.get('group_order'))
            else:
                group.group = None
            group.save()
            model.relation_group = group
            model.visible_by_default = data.get('visible_by_default', False)
            model.style = json.dumps(data.get('style', {}))

            if len(data['indicators']) >= 2:
                model.name = data.get('name', '')
                model.description = data.get('description', '')
            model.save()

            indicatorsQuery = model.dashboardindicatorlayerindicator_set.all()
            ids = []
            for indicator in data['indicators']:
                ids.append(indicator['id'])
            indicatorsQuery.exclude(indicator__id__in=ids).delete()

            for idx, indicator in enumerate(data['indicators']):
                try:
                    layer, created = \
                        DashboardIndicatorLayerIndicator.objects.get_or_create(
                            object=model,
                            indicator=Indicator.objects.get(
                                id=indicator['id']),
                            defaults={
                                'order': idx
                            }
                        )
                    layer.name = indicator['name']
                    layer.color = indicator['color']
                    layer.save()
                except Indicator.DoesNotExist:
                    pass

    def save_relation(self, ModelClass, ObjectClass, modelQuery, inputData):
        """Save relation from data."""
        ids = []

        # Remove all not found ids
        for data in inputData:
            ids.append(data.get('id', 0))

        # Remove all not found ids
        modelQuery.exclude(object__id__in=ids).delete()

        for data in inputData:
            try:
                model = ModelClass.objects.get(
                    dashboard=self,
                    object__id=data['id']
                )
            except (KeyError, ModelClass.DoesNotExist):
                try:
                    object = ObjectClass.objects.get(id=data['id'])
                    model = ModelClass(
                        dashboard=self,
                        object=object
                    )
                except ObjectClass.DoesNotExist:
                    raise Exception(
                        f"{ObjectClass.__name__} with id "
                        f"{data['id']} does not exist")

            model.order = data.get('order', 0)
            model.group = data.get('group', '')
            model.visible_by_default = data.get('visible_by_default', False)
            model.styles = data.get('styles', None)
            model.label_styles = data.get('label_styles', None)
            model.save()

    def save_widgets(self, widget_data):
        """Save widgets from data."""
        from .widget import Widget, LayerUsed
        ids = []

        # Remove all not found ids
        for data in widget_data:
            if 'id' in data:
                ids.append(data['id'])

        # Remove all not found ids
        self.widget_set.exclude(id__in=ids).delete()

        # Save data
        for data in widget_data:
            try:
                try:
                    widget = self.widget_set.get(
                        id=data['id']
                    )
                except (KeyError, Widget.DoesNotExist):
                    widget = Widget(dashboard=self)

                order = data.get('order', 0)
                widget.order = order if order else 0
                widget.visible_by_default = data['visible_by_default']
                widget.group = data['group']
                widget.name = data['name']
                widget.type = data['type']
                widget.description = data['description']
                widget.operation = data['operation']
                widget.unit = data['unit']
                widget.property = data['property']
                widget.layer_used = data['layer_used']
                widget.date_filter_value = data['date_filter_value']
                widget.date_filter_type = data['date_filter_type']

                if widget.layer_used == LayerUsed.INDICATOR:
                    try:
                        widget.indicator = Indicator.objects.get(
                            id=data['layer_id']
                        )
                    except Indicator.DoesNotExist:
                        pass

                # optional data
                try:
                    widget.property_2 = data['property_2']
                except KeyError:
                    pass
                widget.save()
            except KeyError:
                pass
