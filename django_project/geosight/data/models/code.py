"""The code list model."""
from django.contrib.gis.db import models

from core.models import AbstractTerm


class Code(AbstractTerm):
    """The code list."""

    value = models.CharField(
        max_length=512,
        help_text='Code value that used as a code.',
        unique=True
    )

    @property
    def code(self):
        """Return code of the code."""
        return self.value

    @property
    def label(self):
        """Return label of the code."""
        return f'{self.name} ({self.value})'


class CodeList(AbstractTerm):
    """The CodeList."""

    @property
    def codes(self):
        """Return code list."""
        return list(
            self.codeincodelist_set.values_list('code__value', flat=True)
        )

    class Meta:  # noqa: D106
        verbose_name = 'Codelist'
        verbose_name_plural = 'Codelists'


class CodeInCodeList(models.Model):
    """The code list."""

    codelist = models.ForeignKey(
        CodeList, on_delete=models.CASCADE
    )
    code = models.ForeignKey(
        Code, on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )

    class Meta:  # noqa: D106
        ordering = ('order',)
        unique_together = ('codelist', 'code')
