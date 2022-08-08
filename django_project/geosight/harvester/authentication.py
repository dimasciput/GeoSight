"""Requests authentications."""
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from rest_framework import authentication
from rest_framework import exceptions

from geosight.harvester.models.harvester import Harvester


class HarvesterTokenAndBearerAuthentication(
    authentication.TokenAuthentication
):
    """Authentication using token and bearer."""

    keywords = ['Token', 'Bearer']

    def authenticate(self, request):
        """Authenticate request."""
        auth = authentication.get_authorization_header(request).split()

        if not auth or auth[0].lower() not in [
            keyword.lower().encode() for keyword in self.keywords]:
            msg = _('Token is required.')
            raise exceptions.AuthenticationFailed(msg)

        if len(auth) == 1:
            msg = _(
                'Invalid token header. No credentials provided.'
            )
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _(
                'Invalid token header. '
                'Token string should not contain spaces.'
            )
            raise exceptions.AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = _(
                'Invalid token header. '
                'Token string should not contain invalid characters.'
            )
            raise exceptions.AuthenticationFailed(msg)

        kwargs = request.parser_context['kwargs']

        harvester = get_object_or_404(
            Harvester, unique_id=kwargs.get('uuid', 0)
        )
        try:
            token_attr = harvester.harvesterattribute_set.all().filter(
                name='token',
                value=token
            ).first()

            if not token_attr:
                msg = _('Invalid token.')
                raise exceptions.AuthenticationFailed(msg)
        except Harvester.DoesNotExist:
            msg = _('API is not exposed.')
            raise exceptions.AuthenticationFailed(msg)
        return None
