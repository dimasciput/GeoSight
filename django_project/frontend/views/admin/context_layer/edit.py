"""Admin ContextLayer Edit View."""

from braces.views import SuperuserRequiredMixin
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect, reverse, render

from frontend.views._base import BaseView
from geosight.data.forms.context_layer import ContextLayerForm
from geosight.data.models.context_layer import ContextLayer


class ContextLayerEditView(SuperuserRequiredMixin, BaseView):
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
        basemap = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )

        context.update(
            {
                'form': ContextLayerForm(
                    initial=ContextLayerForm.model_to_initial(basemap)
                )
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit basemap."""
        basemap = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        form = ContextLayerForm(
            request.POST,
            instance=basemap
        )
        if form.is_valid():
            form.save()
            return redirect(reverse('admin-context-layer-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
