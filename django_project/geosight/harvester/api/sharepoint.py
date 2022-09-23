"""Return Harvester API."""
import os

from django.conf import settings
from django.http import HttpResponseBadRequest, Http404
from rest_framework.response import Response
from rest_framework.views import APIView


class SharepointFileDetail(APIView):
    """Return Sharepoint File Detail."""

    def get(self, request):
        """Return Sharepoint File Detail."""
        try:
            relative_url = request.GET['relative_url']

            # TODO:
            #  We change it to use sharepoint
            #  ---------------------------------------
            filepath = os.path.join(
                settings.ONEDRIVE_ROOT, relative_url)
            if not os.path.exists(filepath):
                raise Http404(f'File {relative_url} does not exist or deleted')
            #  ---------------------------------------

            return Response('OK')
        except KeyError:
            return HttpResponseBadRequest('relative_url parameter is needed.')
