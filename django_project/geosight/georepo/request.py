"""Reference Layer Control."""
import requests

from core.models.preferences import SitePreferences


class GeorepoUrl:
    """Reference Layer Control."""

    def __init__(self):
        """Init Class."""
        self.georepo_url = SitePreferences.preferences().georepo_url.strip('/')
        self.georepo_api_key = SitePreferences.preferences().georepo_api_key

    @property
    def reference_layer_list(self) -> str:
        """Return API link for reference list."""
        return (
            f'{self.georepo_url}/api/reference-layer/list'
            f'?token={self.georepo_api_key}&cached=False'
        )

    @property
    def reference_layer_detail(self) -> str:
        """Return API link for reference detail."""
        return (
            f'{self.georepo_url}/api/reference-layer/<identifier>'
            f'?token={self.georepo_api_key}&cached=False'
        )

    @property
    def urls(self) -> dict:
        """Return API links in dictionary."""
        return {
            'domain': self.georepo_url,
            'reference_layer_list': self.reference_layer_list,
            'reference_layer_detail': self.reference_layer_detail
        }


class GeorepoRequestError(Exception):
    """Error class for Georepo Request."""

    def __init__(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class GeorepoRequest:
    """Request to georepo."""

    def __init__(self):
        """Init Class."""
        self.urls = GeorepoUrl()

    def get_reference_layer_list(self):
        """Return reference layer."""
        return requests.get(self.urls.reference_layer_list)

    def get_reference_layer_detail(self, reference_layer_identifier: str):
        """Return reference layer."""
        return requests.get(
            self.urls.reference_layer_detail.replace(
                '<identifier>', reference_layer_identifier
            )
        )

    def _request_paginated(self, url: str, page: int = 1) -> list:
        """Return list of responses of paginated request."""
        if '?' not in url:
            url_request = f'{url}?page={page}'
        else:
            url_request = f'{url}&page={page}'
        response = requests.get(url_request)
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Error fetching on {url} "
                f"- {response.status_code} - {response.text}"
            )
        result = response.json()
        if result['total_page'] == page:
            return [result]
        else:
            return [result] + self._request_paginated(url, page + 1)

    def get_reference_layer_geojson(
            self, reference_layer_identifier: str, admin_level: int
    ):
        """Return geojson of reference layer by admin level."""
        response = GeorepoRequest().get_reference_layer_detail(
            reference_layer_identifier
        )
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Fetching reference layer detail error "
                f"- {response.status_code} - {response.text}"
            )
        detail = response.json()
        if 'levels' not in detail:
            raise GeorepoRequestError(
                "Levels data is not provided by georepo.")
        try:
            geojson = {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": []
            }
            for detail_level in detail['levels']:
                if detail_level['level'] == admin_level:
                    geojson_responses = self._request_paginated(
                        f"{self.urls.georepo_url}{detail_level['url']}"
                    )
                    for geojson_response in geojson_responses:
                        geojson['features'] += geojson_response[
                            'results']['features']
            return geojson
        except KeyError:
            raise GeorepoRequestError(
                "Levels data is not provided by georepo.")
