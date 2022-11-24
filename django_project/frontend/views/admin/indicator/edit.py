"""Admin Indicator Edit View."""

import json

from django.shortcuts import get_object_or_404
from django.shortcuts import redirect, reverse, render

from core.utils import string_is_true
from frontend.views.admin.indicator.create import IndicatorCreateView
from geosight.data.forms.indicator import IndicatorForm
from geosight.data.models.indicator import Indicator
from geosight.permission.access import edit_permission_resource


class IndicatorEditView(IndicatorCreateView):
    """Indicator Edit View."""

    template_name = 'frontend/admin/indicator/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Indicator'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        indicator = self.indicator
        list_url = reverse('admin-indicator-list-view')
        edit_url = reverse('admin-indicator-edit-view', args=[indicator.id])
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{indicator.__str__()}</a> '
        )

    @property
    def indicator(self):
        """Return indicator."""
        return get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        edit_permission_resource(self.indicator, self.request.user)
        return context

    def post(self, request, **kwargs):
        """Edit indicator."""
        save_as = string_is_true(request.GET.get('save-as', False))
        if save_as:
            form = IndicatorForm(request.POST)
        else:
            indicator = get_object_or_404(
                Indicator, id=self.kwargs.get('pk', '')
            )
            edit_permission_resource(indicator, self.request.user)
            form = IndicatorForm(
                request.POST,
                instance=indicator
            )
        if form.is_valid():
            indicator = form.save()
            if save_as and not indicator.creator:
                indicator.creator = request.user
                indicator.save()

            self.save_rules(indicator=indicator)
            if save_as:
                return redirect(
                    reverse('admin-indicator-edit-view', kwargs={
                        'pk': indicator.pk
                    })
                )
            else:
                return redirect(reverse('admin-indicator-list-view'))
        context = self.get_context_data(**kwargs)
        form.indicator_data = json.dumps(
            IndicatorForm.model_to_initial(form.instance)
        )
        context['form'] = form
        return render(request, self.template_name, context)
