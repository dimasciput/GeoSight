"""Core admin."""
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from core.models import (
    SitePreferences, SitePreferencesImage, Profile
)

User = get_user_model()
admin.site.unregister(User)


class SitePreferencesImageInline(admin.TabularInline):
    """SitePreferencesImageTheme inline."""

    model = SitePreferencesImage
    extra = 0


class SitePreferencesAdmin(admin.ModelAdmin):
    """Site Preferences admin."""

    fieldsets = (
        (None, {
            'fields': ('site_title', 'disclaimer')
        }),
        ('GeoRepo', {
            'fields': ('georepo_url', 'georepo_api_key'),
        }),
        ('Theme', {
            'fields': (
                'primary_color', 'anti_primary_color',
                'secondary_color', 'anti_secondary_color',
                'tertiary_color', 'anti_tertiary_color',
                'icon', 'favicon'
            ),
        }),
        ('Layer Configuration', {
            'fields': (
                'indicator_no_data_fill_color',
                'indicator_no_data_outline_color',
                'indicator_other_data_fill_color',
                'indicator_other_data_outline_color'
            ),
        }),
    )
    inlines = (SitePreferencesImageInline,)


admin.site.register(SitePreferences, SitePreferencesAdmin)


class ProfileInline(admin.StackedInline):
    """Profile inline."""

    model = Profile


class UserProfileAdmin(UserAdmin):
    """User profile admin."""

    inlines = (ProfileInline,)


admin.site.register(User, UserProfileAdmin)
