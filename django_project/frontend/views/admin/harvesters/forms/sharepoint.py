"""SharepointHarvesterView harvester view."""

from geosight.harvester.harveters.sharepoint_harvester import (
    SharepointHarvester
)
from geosight.harvester.models.harvester import Harvester
from geosight.harvester.models.harvester_log import HarvesterLog, LogStatus
from geosight.harvester.tasks import run_harvester
from ._base import HarvesterFormView


class SharepointHarvesterView(HarvesterFormView):
    """SharepointHarvesterView harvester view."""

    harvester_class = SharepointHarvester
    template_name = 'frontend/admin/harvesters/sharepoint_harvester.html'

    def context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().context_data(**kwargs)
        return context

    def after_post(self, harvester: Harvester):
        """For calling after post success."""
        HarvesterFormView.after_post(self, harvester)
        HarvesterLog.objects.get_or_create(
            harvester=harvester,
            status=LogStatus.START
        )
        run_harvester.delay(harvester.pk)
