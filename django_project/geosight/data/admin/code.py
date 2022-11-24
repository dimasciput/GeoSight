"""Code Admin."""
from django.contrib import admin

from geosight.data.models.code import Code, CodeList, CodeInCodeList


class CodeInCodeListInline(admin.TabularInline):
    """CodeInCodeList inline."""

    model = CodeInCodeList
    extra = 0


class CodeListAdmin(admin.ModelAdmin):
    """CodeList admin."""

    list_display = ('name', 'description')
    inlines = (CodeInCodeListInline,)


class CodeAdmin(admin.ModelAdmin):
    """Code admin."""

    list_display = ('code', 'label')


admin.site.register(CodeList, CodeListAdmin)
admin.site.register(Code, CodeAdmin)
