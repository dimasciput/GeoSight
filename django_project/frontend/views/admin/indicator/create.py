"""Admin Indicator Create View."""

import json

from django.shortcuts import redirect, reverse, render

from frontend.views._base import BaseView
from geosight.data.forms.indicator import IndicatorForm
from geosight.data.models.code import CodeList
from geosight.data.models.indicator import (
    Indicator, IndicatorRule, IndicatorTypeChoices
)
from geosight.data.serializer.code import CodeListSerializer
from geosight.permission.access import RoleCreatorRequiredMixin


class IndicatorCreateView(RoleCreatorRequiredMixin, BaseView):
    """Indicator Create View."""

    template_name = 'frontend/admin/indicator/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Indicator'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-indicator-list-view')
        create_url = reverse('admin-indicator-create-view')
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    @property
    def indicator(self) -> Indicator:
        """Return indicator."""
        return Indicator()

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        indicator = self.indicator
        initial = IndicatorForm.model_to_initial(indicator)
        form = IndicatorForm(initial=initial)
        form.indicator_data = json.dumps(initial)
        context.update(
            {
                'form': form,
                'indicator_id': indicator.id,
                'types': json.dumps(IndicatorTypeChoices),
                'rules': json.dumps(indicator.rules_dict()),
                'codelists': json.dumps(
                    CodeListSerializer(CodeList.objects.all(), many=True).data
                )
            }
        )
        return context

    def save_rules(self, indicator: Indicator):
        """Save rules."""
        request = self.request
        indicator.indicatorrule_set.all().delete()
        order = 0
        for req_key, value in request.POST.dict().items():
            if 'rule_name_' in req_key:
                idx = req_key.replace('rule_name_', '')
                name = request.POST.get(f'rule_name_{idx}', None)
                rule = request.POST.get(f'rule_rule_{idx}', None)
                color = request.POST.get(f'rule_color_{idx}', None)
                outline_color = request.POST.get(
                    f'rule_outline_color_{idx}', None)

                active = request.POST.get(f'rule_active_{idx}', 'true')
                active = True if active.lower() == 'true' else False

                if rule and name:
                    indicator_rule, created = \
                        IndicatorRule.objects.get_or_create(
                            indicator=indicator,
                            name=name
                        )
                    indicator_rule.rule = rule
                    indicator_rule.color = color
                    indicator_rule.order = order
                    indicator_rule.outline_color = outline_color
                    indicator_rule.active = active
                    indicator_rule.save()
                    order += 1

    def post(self, request, **kwargs):
        """Create indicator."""
        form = IndicatorForm(request.POST)
        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.save()
            self.save_rules(indicator=instance)
            return redirect(
                reverse('admin-indicator-edit-view', kwargs={
                    'pk': instance.pk
                })
            )
        context = self.get_context_data(**kwargs)
        form.indicator_data = json.dumps(
            IndicatorForm.model_to_initial(form.instance)
        )
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
