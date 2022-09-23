"""Sharepoint utilities."""

import io

from django.conf import settings
from office365.runtime.auth.authentication_context import AuthenticationContext
from office365.sharepoint.client_context import ClientContext
from office365.sharepoint.files.file import File
from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get


class SharepointError(Exception):
    """Exception raised for errors in sharepoint request."""

    def __init__(self, message="Sharepoint request error."):
        """Init function."""
        self.message = message
        super().__init__(self.message)


class Sharepoint:
    """Sharepoint class that handled all sharepoint function."""

    def __init__(self):
        """Init function."""
        url = settings.SHAREPOINT_URL
        client_id = settings.SHAREPOINT_CLIENT_ID
        client_secret = settings.SHAREPOINT_CLIENT_SECRET

        if not url:
            raise SharepointError('Sharepoint URL is empty.')
        if not client_id:
            raise SharepointError('Client_id is empty.')
        if not client_secret:
            raise SharepointError('Client_secret is empty.')

        self.url = url
        self.client_id = client_id
        self.client_secret = client_secret
        self.context_auth = AuthenticationContext(self.url)

        if self.context_auth.acquire_token_for_app(
                client_id=self.client_id,
                client_secret=self.client_secret
        ):
            self.ctx = ClientContext(self.url, self.context_auth)
        else:
            raise SharepointError('Client ID and Secret is not correct.')

    def load_excelfile(self, relative_url):
        """Get file from relative url."""
        response = File.open_binary(self.ctx, relative_url)
        try:
            if response.status_code == 200:
                file = io.BytesIO(response.content)
                try:
                    return xls_get(file)
                except Exception:
                    return xlsx_get(file)
            else:
                raise SharepointError(
                    f'Error {response.status_code} : {response.text}'
                )
        except Exception as e:
            raise SharepointError(
                f'Error {response.status_code} : {e}'
            )
