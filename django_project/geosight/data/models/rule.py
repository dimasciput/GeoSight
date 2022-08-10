"""Contains Indicator Rule model."""
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _


class RuleModel(models.Model):
    """The rule abstract model."""

    name = models.CharField(
        max_length=512
    )
    rule = models.CharField(
        max_length=256,
        help_text=_(
            'Use formula to create the rule and use x as the value.'
            'Example: x<100. '
            'It will replace x with the value and will check the condition.'
        )
    )
    color = models.CharField(
        max_length=16,
        null=True, blank=True,
        help_text=_(
            'Color of the rule'
        )
    )
    outline_color = models.CharField(
        max_length=16,
        default='#000000',
        help_text=_(
            'Color for the outline of geometry on map.'
        )
    )
    order = models.IntegerField(
        default=0
    )
    active = models.BooleanField(
        default=True
    )

    class Meta:  # noqa: D106
        abstract = True

    @property
    def unit(self):
        """Return unit of the rule."""
        return ''

    @property
    def rule_str(self):
        """Return rule in string list with & as separator."""
        values = []
        if not self.rule:
            return ''
        rules = self.rule.lower().replace(' ', '').split('and')
        for rule in rules:
            current_symbol = None
            for symbol in ['<=', '>=', '==', '<', '>']:
                if symbol in rule:
                    current_symbol = symbol
                    break

            temp = rule.split(current_symbol)
            unit = ''
            if self.unit:
                unit = f'{self.unit}'

            str_symbol = '=' if current_symbol == '==' else symbol
            if temp[0] == 'x':
                values.append(f'{str_symbol}{temp[1]} {unit}')
            else:
                values.append(f'{temp[0]} {unit} {str_symbol}')

        return " & ".join(values)
