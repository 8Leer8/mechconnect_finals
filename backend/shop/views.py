from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Shop, ShopMechanic
from .serializers import ShopDiscoverySerializer
from services.models import Service, ShopServiceMechanic
from services.serializers import ServiceDiscoverySerializer
from accounts.models import Mechanic
from specialties.models import MechanicSpecialty


@api_view(['GET'])
@permission_classes([AllowAny])
def discover_shops(request):
    """
    Get all available shops for discovery page
    """
    try:
        # Get all shops that are active and verified
        shops = Shop.objects.filter(
            is_verified=True,
            status='open'
        ).order_by('-shop_id')
        
        # Check if any shops found
        if not shops.exists():
            return Response({
                'message': 'No shops available',
                'shops': [],
                'total_count': 0
            }, status=status.HTTP_200_OK)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 10))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = shops.count()
        shops_page = shops[start:end]
        
        serializer = ShopDiscoverySerializer(shops_page, many=True)
        
        return Response({
            'message': 'Shops found' if total_count > 0 else 'No shops available',
            'shops': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch shops',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def shop_detail(request, shop_id):
    """
    Get detailed information about a specific shop including services and mechanics
    """
    try:
        # Get shop by ID
        shop = get_object_or_404(Shop, shop_id=shop_id)
        
        # Get shop data
        shop_data = {
            'shop_id': shop.shop_id,
            'shop_name': shop.shop_name,
            'contact_number': shop.contact_number,
            'email': shop.email,
            'website': shop.website,
            'description': shop.description,
            'service_banner': shop.service_banner,
            'is_verified': shop.is_verified,
            'status': shop.status,
            'created_at': shop.created_at,
        }
        
        # Get shop services through ShopService relationship
        shop_services = Service.objects.filter(
            shop_services__shop=shop
        ).distinct().order_by('-service_id')
        
        services_data = []
        for service in shop_services:
            # Get service mechanics for this specific shop service through ShopService
            shop_service = service.shop_services.filter(shop=shop).first()
            service_mechanics = Mechanic.objects.filter(
                shop_service_assignments__shop_service=shop_service
            ) if shop_service else []
            
            mechanics_list = []
            for mechanic in service_mechanics:
                mechanics_list.append({
                    'mechanic_id': mechanic.mechanic_id.acc_id,
                    'full_name': f"{mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname}",
                })
            
            services_data.append({
                'service_id': service.service_id,
                'service_name': service.name,
                'description': service.description,
                'price': float(service.price),
                'category': service.service_category.name if service.service_category else 'General',
                'assigned_mechanics': mechanics_list,
                'created_at': service.created_at,
            })
        
        # Get shop mechanics
        shop_mechanics = Mechanic.objects.filter(
            shop_memberships__shop=shop
        ).order_by('-mechanic_id')
        
        mechanics_data = []
        for mechanic in shop_mechanics:
            # Get specialties
            specialties = MechanicSpecialty.objects.filter(
                mechanic=mechanic
            ).select_related('specialty')
            
            specialties_list = [specialty.specialty.specialty_name for specialty in specialties]
            
            mechanics_data.append({
                'mechanic_id': mechanic.mechanic_id.acc_id,
                'full_name': f"{mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname}",
                'bio': mechanic.bio,
                'specialties': specialties_list,
            })
        
        # Get shop stats
        total_services = len(services_data)
        total_mechanics = len(mechanics_data)
        
        return Response({
            'message': 'Shop details retrieved successfully',
            'shop': shop_data,
            'services': services_data,
            'mechanics': mechanics_data,
            'stats': {
                'total_services': total_services,
                'total_mechanics': total_mechanics,
                'rating': 4.7,  # This would come from ratings system
                'jobs_completed': 512  # This would come from bookings system
            }
        }, status=status.HTTP_200_OK)
        
    except Shop.DoesNotExist:
        return Response({
            'error': 'Shop not found',
            'message': f'Shop with ID {shop_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch shop details',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
