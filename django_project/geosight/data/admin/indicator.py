"""Indicator admin."""
from django.contrib import admin

from geosight.data.models.indicator import (
    Indicator, IndicatorGroup,
    IndicatorValue, IndicatorRule, IndicatorExtraValue
)


class IndicatorExtraValueRuleInline(admin.TabularInline):
    """IndicatorExtraValue inline."""

    model = IndicatorExtraValue
    extra = 0


class IndicatorValueAdmin(admin.ModelAdmin):
    """IndicatorValue admin."""

    list_display = (
        'indicator', 'date', 'value',
        'geom_identifier', 'reference_layer', 'admin_level'
    )
    list_filter = (
        'indicator', 'date', 'reference_layer', 'admin_level'
    )
    search_fields = ('indicator__name', 'geom_identifier')
    inlines = (IndicatorExtraValueRuleInline,)


class IndicatorRuleInline(admin.TabularInline):
    """IndicatorRule inline."""

    model = IndicatorRule
    extra = 0


class IndicatorAdmin(admin.ModelAdmin):
    """Indicator admin."""

    list_display = ('name', 'group', 'creator')
    list_filter = ('group',)
    inlines = (IndicatorRuleInline,)
    list_editable = ('creator', 'group')


class IndicatorGroupAdmin(admin.ModelAdmin):
    """IndicatorGroup admin."""

    list_display = ('name',)


admin.site.register(IndicatorGroup, IndicatorGroupAdmin)
admin.site.register(IndicatorValue, IndicatorValueAdmin)
admin.site.register(Indicator, IndicatorAdmin)
