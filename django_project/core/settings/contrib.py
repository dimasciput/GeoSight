# coding=utf-8
"""Settings for 3rd party."""
import os

from .base import *  # noqa

# Extra installed apps
INSTALLED_APPS = INSTALLED_APPS + (
    'rest_framework',
    'rest_framework_gis',
    'webpack_loader',
)
WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': True,
        'BUNDLE_DIR_NAME': 'frontend/',  # must end with slash
        'STATS_FILE': ABS_PATH('frontend', 'webpack-stats.prod.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None,
        'IGNORE': [r'.+\.hot-update.js', r'.+\.map'],
        'LOADER_CLASS': 'webpack_loader.loader.WebpackLoader',
    }
}

# SHAREPOINT CONFIG
SHAREPOINT_URL = os.environ.get('SHAREPOINT_URL', None)
SHAREPOINT_CLIENT_ID = os.environ.get('SHAREPOINT_CLIENT_ID', None)
SHAREPOINT_CLIENT_SECRET = os.environ.get('SHAREPOINT_CLIENT_SECRET', None)
