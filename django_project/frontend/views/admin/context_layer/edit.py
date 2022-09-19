"""Admin ContextLayer Edit View."""

import json

from django.shortcuts import get_object_or_404
from django.shortcuts import redirect, reverse, render

from frontend.views._base import BaseView
from geosight.data.forms.context_layer import ContextLayerForm
from geosight.data.models.context_layer import ContextLayer
from geosight.permission.access import edit_permission_resource


class ContextLayerEditView(BaseView):
    """ContextLayer Edit View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Context Layer'

    @property
    def content_title(self):
        """Return content title that used on page title basemap."""
        context_layer = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-context-layer-list-view')
        edit_url = reverse(
            'admin-context-layer-edit-view', args=[context_layer.id]
        )
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{context_layer.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        instance = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(instance, self.request.user)

        context.update(
            {
                'form': ContextLayerForm(
                    initial=ContextLayerForm.model_to_initial(instance)
                )
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit basemap."""
        instance = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(instance, self.request.user)
        data = request.POST.copy()
        data['data_fields'] = json.loads(request.POST.get('data_fields', '[]'))
        form = ContextLayerForm(
            data,
            instance=instance
        )

        if form.is_valid():
            context_layer = form.save()
            context_layer.save_relations(data)
            return redirect(reverse('admin-context-layer-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
