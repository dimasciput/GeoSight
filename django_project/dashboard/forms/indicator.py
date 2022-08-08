"""Indicator form."""
from django import forms
from django.forms.models import model_to_dict

from geosight.data.models.indicator import Indicator, IndicatorGroup


class IndicatorForm(forms.ModelForm):
    """Indicator form."""

    label_suffix = ""
    group = forms.ChoiceField()

    def __init__(self, *args, **kwargs):
        """Init."""
        super().__init__(*args, **kwargs)
        self.fields['group'].choices = [('', '')] + [
            (group.name, group.name)
            for group in IndicatorGroup.objects.all().order_by('name')
        ]

        try:
            if self.data['group']:
                self.fields['group'].choices += [
                    (self.data['group'], self.data['group'])
                ]
        except KeyError:
            pass

    class Meta:  # noqa: D106
        model = Indicator
        exclude = (
            'order', 'geometry_reporting_units',
            'instance', 'show_in_context_analysis'
        )

    def clean_group(self):
        """Return group."""
        group = self.cleaned_data['group']
        indicator_group, created = IndicatorGroup.objects.get_or_create(
            name=group
        )
        return indicator_group

    @staticmethod
    def model_to_initial(indicator: Indicator):
        """Return model data as json."""
        from geosight.data.models.indicator import IndicatorGroup
        initial = model_to_dict(indicator)
        try:
            initial['group'] = IndicatorGroup.objects.get(
                id=initial['group']
            ).name
        except IndicatorGroup.DoesNotExist:
            initial['group'] = None
        return initial
