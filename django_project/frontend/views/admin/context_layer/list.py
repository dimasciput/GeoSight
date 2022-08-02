"""Admin ContextLayer List View."""

from braces.views import SuperuserRequiredMixin
from django.shortcuts import reverse

from frontend.views._base import BaseView


class ContextLayerListView(SuperuserRequiredMixin, BaseView):
    """ContextLayer Detail View."""

    template_name = 'frontend/admin/context_layer/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Context Layers'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-context-layer-list-view')
        return f'<a href="{list_url}">Context Layers</a>'
