"""Admin Basemap Edit View."""

from django.shortcuts import get_object_or_404
from django.shortcuts import redirect, reverse, render

from frontend.views._base import BaseView
from geosight.data.forms.basemap import BasemapForm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.permission.access import edit_permission_resource


class BasemapEditView(BaseView):
    """Basemap Edit View."""

    template_name = 'frontend/admin/basemap/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Basemap'

    @property
    def content_title(self):
        """Return content title that used on page title basemap."""
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-basemap-list-view')
        edit_url = reverse('admin-basemap-edit-view', args=[basemap.id])
        return (
            f'<a href="{list_url}">Basemaps</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{basemap.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(basemap, self.request.user)

        context.update(
            {
                'form': BasemapForm(
                    initial=BasemapForm.model_to_initial(basemap)
                )
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit basemap."""
        basemap = get_object_or_404(
            BasemapLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(basemap, self.request.user)
        form = BasemapForm(
            request.POST,
            instance=basemap
        )
        if form.is_valid():
            form.save()
            return redirect(reverse('admin-basemap-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
