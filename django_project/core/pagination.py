"""Page number pagination."""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class Pagination(PageNumberPagination):
    """Pagination for API."""

    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        """Response for pagination."""
        return Response({
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'page_size': self.page.paginator.num_pages,
            'results': data,
        })
