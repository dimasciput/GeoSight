# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth import get_user_model
from django.db import migrations

from core.models.profile import Profile, ROLES

User = get_user_model()


def run(apps, schema_editor):
    for user in User.objects.all():
        if user.is_staff:
            Profile.update_role(user, ROLES.SUPER_ADMIN.name)
        else:
            Profile.update_role(user, ROLES.VIEWER.name)


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0005_profile')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
