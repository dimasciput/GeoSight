"""Context layer models."""
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models import AbstractEditData, AbstractTerm
from geosight.permission.models.manager import PermissionManager


class LayerType(object):
    """A quick couple of variable and Layer Type string."""

    ARCGIS = 'ARCGIS'
    GEOJSON = 'Geojson'
    RASTER_TILE = 'Raster Tile'


class ContextLayerGroup(AbstractTerm):
    """A model for the group of context layer."""

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Override save."""
        super(ContextLayerGroup, self).save(*args, **kwargs)


class ContextLayer(AbstractEditData, AbstractTerm):
    """A model for the context layer."""

    group = models.ForeignKey(
        ContextLayerGroup,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    url = models.CharField(
        max_length=10240,
        help_text=(
            "Can put full url with parameters and system will use that. "
            "Or system will use 'CONTEXT LAYER PARAMETERS' "
            "if there is no parameters on the url."
        )
    )
    url_legend = models.CharField(
        max_length=256,
        null=True, blank=True
    )
    layer_type = models.CharField(
        max_length=256,
        default=LayerType.ARCGIS,
        choices=(
            (LayerType.ARCGIS, LayerType.ARCGIS),
            (LayerType.GEOJSON, LayerType.GEOJSON),
            (LayerType.RASTER_TILE, LayerType.RASTER_TILE),
        )
    )
    token = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=_(
            "Token to access the layer if needed."
        )
    )
    username = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=_(
            "Username to access the layer if needed."
        )
    )
    password = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=_(
            "Password to access the layer if needed."
        )
    )
    styles = models.TextField(
        null=True, blank=True
    )
    label_styles = models.TextField(
        null=True, blank=True
    )
    objects = models.Manager()
    permissions = PermissionManager()

    def save_relations(self, data):
        """Save all relationship data."""
        self.contextlayerfield_set.all().delete()
        for idx, field in enumerate(data['data_fields']):
            ContextLayerField.objects.get_or_create(
                context_layer=self,
                name=field['name'],
                alias=field['alias'],
                type=field['type'],
                visible=field.get('visible', True),
                as_label=field.get('as_label', False),
                order=idx
            )


class ContextLayerFieldAbstract(models.Model):
    """Field data of context layer."""

    name = models.CharField(
        max_length=512
    )
    alias = models.CharField(
        max_length=512
    )
    visible = models.BooleanField(
        default=True
    )
    type = models.CharField(
        max_length=512,
        default='string'
    )
    order = models.IntegerField(
        default=0
    )
    as_label = models.BooleanField(
        default=False
    )

    class Meta:  # noqa: D106
        abstract = True


class ContextLayerField(ContextLayerFieldAbstract):
    """Field data of context layer."""

    context_layer = models.ForeignKey(
        ContextLayer, on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('context_layer', 'name')

    def __str__(self):
        return f'{self.name}'
