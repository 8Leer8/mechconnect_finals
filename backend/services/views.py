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


@api_view(['GET'])
@permission_classes([AllowAny])
def service_provider_info(request, service_id):
    """
    Get service provider information to determine redirect destination
    """
    try:
        # Get service by ID
        service = get_object_or_404(Service, service_id=service_id)
        
        # Check if service belongs to a shop
        shop_service = ShopService.objects.filter(service=service).first()
        if shop_service:
            return Response({
                'service_id': service.service_id,
                'service_name': service.name,
                'provider_type': 'shop',
                'provider_id': shop_service.shop.shop_id,
                'provider_name': shop_service.shop.shop_name,
                'redirect_url': f'/client/service/shopServiceDetail/{service.service_id}'
            }, status=status.HTTP_200_OK)
        
        # Check if service belongs to independent mechanic(s)
        mechanic_service = MechanicService.objects.filter(service=service).first()
        if mechanic_service:
            return Response({
                'service_id': service.service_id,
                'service_name': service.name,
                'provider_type': 'mechanic',
                'provider_id': mechanic_service.mechanic.mechanic_id.acc_id,
                'provider_name': f"{mechanic_service.mechanic.mechanic_id.firstname} {mechanic_service.mechanic.mechanic_id.lastname}",
                'redirect_url': f'/client/service/independentMechanicService/{service.service_id}'
            }, status=status.HTTP_200_OK)
        
        # Service has no provider (shouldn't happen in normal cases)
        return Response({
            'service_id': service.service_id,
            'service_name': service.name,
            'provider_type': 'unknown',
            'message': 'Service provider not found'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Service.DoesNotExist:
        return Response({
            'error': 'Service not found',
            'message': f'Service with ID {service_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': 'Failed to get service provider info',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def service_detail(request, service_id):
    """
    Get comprehensive service details including provider information, price, and description
    """
    try:
        # Get service by ID
        service = get_object_or_404(Service, service_id=service_id)
        
        # Base service data
        service_data = {
            'service_id': service.service_id,
            'service_name': service.name,
            'description': service.description,
            'price': float(service.price) if service.price else 0,
            'service_banner': service.service_banner,
            'category': service.service_category.name if service.service_category else 'General',
            'created_at': service.created_at,
        }
        
        # Check if service belongs to a shop
        shop_service = ShopService.objects.filter(service=service).first()
        if shop_service:
            service_data.update({
                'provider_type': 'shop',
                'provider_id': shop_service.shop.shop_id,
                'provider_name': shop_service.shop.shop_name,
                'provider_contact': shop_service.shop.contact_number,
                'provider_email': shop_service.shop.email,
                'provider_description': shop_service.shop.description,
            })
            return Response(service_data, status=status.HTTP_200_OK)
        
        # Check if service belongs to independent mechanic(s)
        mechanic_service = MechanicService.objects.filter(service=service).first()
        if mechanic_service:
            service_data.update({
                'provider_type': 'mechanic',
                'provider_id': mechanic_service.mechanic.mechanic_id.acc_id,
                'provider_name': f"{mechanic_service.mechanic.mechanic_id.firstname} {mechanic_service.mechanic.mechanic_id.lastname}",
                'provider_contact': mechanic_service.mechanic.contact_number,
                'provider_bio': mechanic_service.mechanic.bio,
            })
            return Response(service_data, status=status.HTTP_200_OK)
        
        # Service has no provider (shouldn't happen in normal cases)
        return Response({
            'error': 'Service provider not found',
            'message': f'Service with ID {service_id} has no associated provider'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Service.DoesNotExist:
        return Response({
            'error': 'Service not found',
            'message': f'Service with ID {service_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': 'Failed to get service details',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_service_addons(request, service_id):
    """
    Get all add-ons for a specific service
    """
    try:
        from .models import ServiceAddOn
        
        # Check if service exists
        try:
            service = Service.objects.get(service_id=service_id)
        except Service.DoesNotExist:
            return Response({
                'error': 'Service not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all add-ons for this service
        addons = ServiceAddOn.objects.filter(service=service).order_by('name')
        
        addons_data = [{
            'service_add_on_id': addon.service_add_on_id,
            'name': addon.name,
            'description': addon.description,
            'price': str(addon.price),
            'created_at': addon.created_at.isoformat() if addon.created_at else None
        } for addon in addons]
        
        return Response({
            'message': f'Found {len(addons_data)} add-ons',
            'addons': addons_data,
            'service_id': service_id,
            'service_name': service.name
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to get service add-ons',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
