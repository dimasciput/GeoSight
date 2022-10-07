"""Abstract class for harvester."""
import datetime
import traceback
from abc import ABC, abstractmethod

import requests
from django.contrib.auth import get_user_model
from django.utils import timezone

from geosight.data.models import IndicatorValue
from geosight.data.models.indicator.indicator import (
    IndicatorValueRejectedError
)
from geosight.harvester.models import Harvester, HarvesterLog, LogStatus

User = get_user_model()


class HarvestingError(Exception):
    """Error class for Harvesting."""

    def __init__(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class BaseHarvester(ABC):
    """Abstract class for harvester."""

    log = None
    description = ""
    attributes = {}
    mapping = {}
    done_message = ''

    def __init__(self, harvester: Harvester):
        """init."""
        self.harvester = harvester
        for attribute in harvester.harvesterattribute_set.all():
            if attribute.value:
                self.attributes[attribute.name] = attribute.value
            else:
                try:
                    attribute.file.path
                    self.attributes[attribute.name] = attribute.file
                except ValueError:
                    self.attributes[attribute.name] = None
        for attribute in harvester.harvestermappingvalue_set.all():
            self.mapping[attribute.remote_value] = attribute.platform_value

    @staticmethod
    def additional_attributes(**kwargs) -> dict:
        """Attributes that needs to be saved on database.

        The value is the default value for the attribute
        This will be used by harvester
        """
        return {}

    @property
    def _headers(self) -> dict:
        """Return headers."""
        return {}

    def eval_json(self, json, str) -> dict:
        """Evaluate json."""
        return eval(str.replace('x', 'json'))

    @abstractmethod
    def _process(self):
        """Run the harvester process."""

    @property
    def allow_to_harvest_new_data(self):
        """Check if the new data can be harvested.

        It will check based on the frequency
        """
        last_data = self.harvester.harvesterlog_set.all().first()
        if not last_data:
            return True
        if not self.harvester.frequency:
            return False

        difference = timezone.now() - last_data.start_time
        frequency = self.harvester.frequency
        return difference.days >= frequency

    def check_attributes(self):
        """Check attributes."""
        # check the attributes
        for attr_key, attr_value in \
                self.__class__.additional_attributes().items():
            if attr_value.get('required', True):
                if not self.attributes[attr_key]:
                    raise HarvestingError(
                        f'{attr_key} is required and it is empty')

    def run(self, force=False):
        """To run the process."""
        if self.allow_to_harvest_new_data or force:
            try:
                self.log, created = HarvesterLog.objects.get_or_create(
                    harvester=self.harvester,
                    status=LogStatus.START
                )
                self.log.status = LogStatus.RUNNING
                self.log.save()
                self.check_attributes()
                self._process()
                self._done()
            except HarvestingError as e:
                self._error(f'{e}')
            except Exception:
                self._error(
                    f'{traceback.format_exc().replace(" File", "<br>File")}'
                )

    def _request_api(self, url: str):
        """Request function."""
        try:
            response = requests.get(url, headers=self._headers)
            if response.status_code == 404:
                return {}
            response.raise_for_status()
            return response
        except (
                requests.exceptions.RequestException,
                requests.exceptions.HTTPError) as e:
            raise HarvestingError(f'{url} : {e}')

    def _error(self, message):
        """Raise error and update log."""
        self.harvester.save()

        self.log.end_time = timezone.now()
        self.log.status = LogStatus.ERROR
        self.log.note = message
        self.log.save()

    def _done(self, message=''):
        """Update log to done."""
        self.harvester.save()

        self.log.end_time = timezone.now()
        self.log.status = LogStatus.DONE
        self.log.note = message if message else self.done_message
        self.log.save()

    def _update(self, message=''):
        """Update note for the log."""
        if self.log:
            self.log.note = message
            self.log.save()

    def save_indicator_data(
            self, value: str, date: datetime.date, geometry: str
    ) -> IndicatorValue:
        """Save new indicator data of the indicator."""
        try:
            return self.harvester.indicator.save_value(
                date, geometry, float(value),
                reference_layer=self.harvester.reference_layer,
                admin_level=self.harvester.admin_level
            )
        except (IndicatorValueRejectedError, ValueError):
            return None
