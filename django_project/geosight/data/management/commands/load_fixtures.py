"""Update all fixtures."""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Update all fixtures."""

    def handle(self, *args, **options):
        """Command handler."""
        # call_command('loaddata', 'geosight/data/fixtures/fixtures.json')
        # TODO:
        #  This fixtures has been deprecated
        #  We need to fix it
