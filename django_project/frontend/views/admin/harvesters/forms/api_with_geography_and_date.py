"""HarvesterAPIWithGeographyAndDate Harvester View."""
from geosight.harvester.harveters.api_with_geography_and_date import (
    APIWithGeographyAndDate
)
from ._base import HarvesterFormView


class HarvesterAPIWithGeographyAndDateView(HarvesterFormView):
    """HarvesterAPIWithGeographyAndDate Harvester View."""

    harvester_class = APIWithGeographyAndDate
    template_name = (
        'frontend/admin/harvesters/api_with_geography_and_date.html'
    )
