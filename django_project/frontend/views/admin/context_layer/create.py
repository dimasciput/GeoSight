"""Admin ContextLayer Create View."""

from django.shortcuts import redirect, reverse, render

from frontend.views._base import BaseView
from geosight.data.forms.context_layer import ContextLayerForm
from geosight.data.models.context_layer import ContextLayer
from geosight.permission.access import RoleCreatorRequiredMixin


class ContextLayerCreateView(RoleCreatorRequiredMixin, BaseView):
    """ContextLayer Create View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Context Layer'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-context-layer-list-view')
        create_url = reverse('admin-context-layer-create-view')
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        initial = None

        # from_id used for duplication
        from_id = self.request.GET.get('from')
        if from_id:
            try:
                model = ContextLayer.objects.get(id=from_id)
                initial = ContextLayerForm.model_to_initial(model)
                initial['name'] = None
                initial['description'] = None
            except ContextLayer.DoesNotExist:
                pass

        context.update(
            {
                'form': ContextLayerForm(initial=initial)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        data = request.POST.copy()
        data['data_fields'] = data.get('data_fields', '[]')
        form = ContextLayerForm(data)

        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.save()
            instance.save_relations(data)
            return redirect(reverse('admin-context-layer-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
