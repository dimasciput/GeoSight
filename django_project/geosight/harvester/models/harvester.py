"""Harvester Model."""
import uuid

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.utils.module_loading import import_string
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractEditData
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayer
from geosight.permission.models.manager import PermissionManager

User = get_user_model()
APIWithGeographyAndTodayDate = (
    (
        'geosight.harvester.harveters.api_with_geography_and_today_date.'
        'APIWithGeographyAndTodayDate'
    ),
    'API With Geography Using Today Date',
)
APIListWithGeographyAndDate = (
    (
        'geosight.harvester.harveters.api_with_geography_and_date.'
        'APIWithGeographyAndDate'
    ),
    'API With Geography And Date',
)
SharepointHarvester = (
    'geosight.harvester.harveters.sharepoint_harvester.SharepointHarvester',
    'Sharepoint File',
)
UsingExposedAPI = (
    'geosight.harvester.harveters.using_exposed_api.UsingExposedAPI',
    'Harvested using exposed API by external client',
)
ExcelHarvester = (
    'geosight.harvester.harveters.excel_harvester.ExcelHarvester',
    'Excel Harvesters',
)
HARVESTERS = (
    APIWithGeographyAndTodayDate,
    APIListWithGeographyAndDate,
    SharepointHarvester,
    UsingExposedAPI,
)
ALL_HARVESTERS = HARVESTERS + (
    ExcelHarvester,
)


class Harvester(AbstractEditData):
    """Harvester of indicator data."""

    unique_id = models.UUIDField(
        default=uuid.uuid4, editable=False
    )
    harvester_class = models.CharField(
        max_length=256,
        help_text=_(
            "The type of harvester that will be used."
            "Use class with full package."),
        choices=ALL_HARVESTERS
    )
    active = models.BooleanField(
        default=True,
        help_text=_(
            'Make this harvester ready to be harvested.')
    )

    # Data that used for saving values
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE,
        null=True, blank=True
    )
    reference_layer = models.ForeignKey(
        ReferenceLayer,
        help_text=_('Reference layer.'),
        on_delete=models.CASCADE,
    )
    admin_level = models.IntegerField(default=0)
    frequency = models.IntegerField(
        null=True, blank=True,
        help_text=_('The frequency in days that the harvester will run.')
    )
    objects = models.Manager()
    permissions = PermissionManager()

    def __str__(self):
        """Return str."""
        return str(self.unique_id)

    @property
    def is_run(self):
        """Return harvester class of indicator."""
        from geosight.harvester.models.harvester_log import LogStatus
        return self.harvesterlog_set.filter(status=LogStatus.RUNNING).count()

    @property
    def last_run(self):
        """Return last run of the harvester."""
        last_log = self.harvesterlog_set.all().first()
        if last_log:
            return last_log.start_time
        else:
            return None

    @property
    def get_harvester_class(self):
        """Return harvester class of indicator."""
        return import_string(self.harvester_class)

    @property
    def harvester_name(self):
        """Return harvester name of indicator."""
        for harvester in ALL_HARVESTERS:
            if harvester[0] == self.harvester_class:
                return harvester[1]
        return ''

    def save(self, *args, **kwargs):
        """Save model."""
        super().save(*args, **kwargs)
        self.save_default_attributes(harvester=self)

    def save_default_attributes(self, **kwargs):
        """Save default attributes for the harvesters."""
        from geosight.harvester.models import HarvesterAttribute
        harvester = self.get_harvester_class
        for key, value in harvester.additional_attributes(**kwargs).items():
            HarvesterAttribute.objects.get_or_create(
                harvester=self,
                name=key,
                defaults={
                    'value': value.get('value', '')
                }
            )

    def save_attributes(self, data):
        """Save attributes for the harvesters."""
        from geosight.harvester.models.harvester_attribute import (
            HarvesterAttribute
        )
        for key, value in data.items():
            try:
                attribute = self.harvesterattribute_set.get(name=key)
                attribute.value = value
                attribute.save()
            except HarvesterAttribute.DoesNotExist:
                pass

    def save_mapping(self, data):
        """Save mapping for the harvesters."""
        from geosight.harvester.models.harvester_attribute import (
            HarvesterMappingValue
        )
        for key, value in data.items():
            try:
                mapping_platform = key
                mapping_remote = value
                mapping, created = HarvesterMappingValue.objects.get_or_create(
                    harvester=self,
                    remote_value=mapping_remote,
                    defaults={
                        'platform_value': mapping_platform
                    }
                )
                mapping.platform_value = mapping_platform
                mapping.save()
            except KeyError:
                pass

    def get_attributes(self):
        """Get attributes keys."""
        from geosight.harvester.models import HarvesterAttribute
        ids = []
        attributes = []
        additional_attributes = self.get_harvester_class.additional_attributes(
            harvester=self
        )
        for name, attribute in additional_attributes.items():
            try:
                attr = self.harvesterattribute_set.get(name=name)
                attr.name = attr.human_name
                try:
                    attr.name = attribute['title']
                except KeyError:
                    pass

                if attr.value:
                    attributes.append(attr)
                    ids.append(attr.id)
            except HarvesterAttribute.DoesNotExist:
                pass
        for attr in self.harvesterattribute_set.exclude(id__in=ids):
            if attr.value:
                attributes.append(attr)
        return attributes

    def run(self, force=False):
        """Run the harvester."""
        if self.active:
            self.get_harvester_class(self).run(force)

    @property
    def short_log_list(self):
        """Return 10 of logs."""
        return self.harvesterlog_set.all()[:10]
