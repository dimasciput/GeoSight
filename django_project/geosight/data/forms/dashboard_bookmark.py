"""Dashboard form."""

import json

from django import forms
from django.contrib.gis.geos import Polygon

from geosight.data.models.dashboard import DashboardBookmark


class DashboardBookmarkForm(forms.ModelForm):
    """DashboardBookmark form."""

    class Meta:  # noqa: D106
        model = DashboardBookmark
        fields = '__all__'

    @staticmethod
    def update_data(data):
        """Update data from POST data."""
        # save polygon
        poly = Polygon.from_bbox(data['extent'])
        poly.srid = 4326
        data['extent'] = poly
        data['filters'] = json.dumps(data['filters'])
        return data
