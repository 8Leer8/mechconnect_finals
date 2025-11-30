from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Service, ServiceCategory, MechanicService, ShopService
from .serializers import ServiceDiscoverySerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def discover_services(request):
    """
    Get all available services for discovery page
    """
    try:
        # Get all services
        services = Service.objects.select_related(
            'service_category'
        ).prefetch_related(
            'mechanic_services__mechanic',
            'shop_services__shop'
        ).order_by('-service_id')
        
        # Check if any services found
        if not services.exists():
            return Response({
                'message': 'No services available',
                'services': [],
                'total_count': 0
            }, status=status.HTTP_200_OK)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 10))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = services.count()
        services_page = services[start:end]
        
        serializer = ServiceDiscoverySerializer(services_page, many=True)
        
        return Response({
            'message': 'Services found' if total_count > 0 else 'No services available',
            'services': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch services',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
