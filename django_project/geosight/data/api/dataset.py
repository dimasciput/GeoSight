"""API for dataset."""

import json
from datetime import datetime

from django.core.exceptions import (
    FieldError, ValidationError, SuspiciousOperation
)
from django.http import HttpResponseBadRequest
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from core.pagination import Pagination
from geosight.data.models.indicator import (
    IndicatorValue, IndicatorValueRejectedError
)
from geosight.data.serializer.indicator import (
    IndicatorValueWithPermissionSerializer
)
from geosight.permission.models.resource import (
    ReferenceLayerIndicatorPermission
)


class DatasetApiList(ListAPIView):
    """Return Data List API List."""

    pagination_class = Pagination
    serializer_class = IndicatorValueWithPermissionSerializer

    def get_serializer_context(self):
        """For serializer context."""
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_param_value(self, param_key: str) -> list:
        """Return paramater value as list."""
        values = self.request.GET.get(param_key, None)
        if values:
            return values.split(',')
        return None

    def get_queryset(self):
        """Return queryset of API."""
        query = None
        try:
            if self.request.user.profile.is_admin:
                query = IndicatorValue.objects.all()
        except AttributeError:
            pass

        # If not query
        if not query:
            filters = None
            for dataset in ReferenceLayerIndicatorPermission.permissions.list(
                    user=self.request.user
            ):
                obj = dataset.obj
                row_query = Q(indicator_id=obj.indicator.id)
                row_query.add(
                    Q(reference_layer_id=obj.reference_layer.id), Q.AND
                )

                if not filters:
                    filters = row_query
                else:
                    filters.add(row_query, Q.OR)
            if not filters:
                query = IndicatorValue.objects.none()
            else:
                query = IndicatorValue.objects.filter(filters)

        # Filter by parameters
        for param, value in self.request.GET.items():
            if param in ['page', 'page_size']:
                continue
            if '_in' in param:
                value = value.split(',')
            if 'date' in param:
                try:
                    value = datetime.fromtimestamp(int(value))
                    print(value)
                except (ValueError, TypeError):
                    pass
            try:
                query = query.filter(**{param: value})
            except FieldError:
                raise SuspiciousOperation(f'Can not query param {param}')
            except ValidationError as e:
                raise SuspiciousOperation(e)
        return query.order_by(
            'indicator', 'reference_layer', '-date', 'geom_identifier'
        )

    def post(self, request):
        """Delete data."""
        data = json.loads(request.data['data'])
        for row in data:
            try:
                value = IndicatorValue.objects.get(id=row['id'])
                if value.permissions(request.user)['edit']:
                    value.indicator.save_value(
                        value.date, value.geom_identifier, row['value'],
                        value.reference_layer, value.admin_level
                    )
                    value.value = float(row['value'])
                    value.save()
            except (IndicatorValue.DoesNotExist, ValueError):
                pass
            except IndicatorValueRejectedError as e:
                return HttpResponseBadRequest(f'{e}')
        return Response('OK')

    def delete(self, request):
        """Delete data."""
        ids = json.loads(request.data['ids'])
        for value in IndicatorValue.objects.filter(id__in=ids):
            if value.permissions(request.user)['delete']:
                value.delete()
        return Response('OK')
