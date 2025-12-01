from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import Account, Notification
from shop.models import Shop


@api_view(['GET'])
@permission_classes([AllowAny])
def get_shops(request):
    """
    Get all shops for head admin
    """
    try:
        from shop.models import ShopMechanic
        from services.models import ShopService
        
        shops = Shop.objects.all().select_related('shop_owner').prefetch_related('shop_mechanics')
        
        shops_data = []
        for shop in shops:
            # Get owner info
            owner_account = None
            owner_contact = ""
            if shop.shop_owner:
                owner_account = shop.shop_owner.shop_owner_id
                owner_contact = shop.shop_owner.contact_number or ""
            
            # Get shop address from owner's account if available
            address = ""
            city = ""
            if owner_account and hasattr(owner_account, 'address'):
                addr = owner_account.address
                address = f"{addr.house_building_number or ''} {addr.street_name or ''}, {addr.barangay or ''}".strip()
                city = f"{addr.city_municipality or ''}, {addr.province or ''}".strip()
            
            # Count mechanics through ShopMechanic
            total_mechanics = shop.shop_mechanics.count()
            
            # Count services through ShopService
            total_services = ShopService.objects.filter(shop=shop).count()
            
            shops_data.append({
                'id': shop.shop_id,
                'shop_name': shop.shop_name,
                'shop_photo': shop.service_banner,
                'owner_id': owner_account.acc_id if owner_account else None,
                'owner_name': f"{owner_account.firstname} {owner_account.lastname}" if owner_account else "Unknown",
                'owner_email': owner_account.email if owner_account else "",
                'owner_contact': owner_contact,
                'is_verified': shop.is_verified,
                'is_active': shop.status == 'open',
                'address': address,
                'city': city,
                'created_at': shop.created_at.isoformat(),
                'total_mechanics': total_mechanics,
                'average_rating': None,
                'total_services': total_services
            })
        
        return Response(shops_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch shops',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_shop(request):
    """
    Verify a shop
    """
    try:
        admin_id = request.data.get('admin_id')
        shop_id = request.data.get('shop_id')
        
        if not admin_id or not shop_id:
            return Response({
                'error': 'admin_id and shop_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        shop = get_object_or_404(Shop, shop_id=shop_id)
        
        # Verify the shop
        shop.is_verified = True
        shop.save()
        
        # Notify shop owner if they have an account
        if shop.shop_owner:
            owner_account = shop.shop_owner.shop_owner_id
            Notification.objects.create(
                receiver=owner_account,
                title='Shop Verified',
                message=f'Your shop "{shop.shop_name}" has been verified!',
                type='info'
            )
        
        return Response({
            'message': 'Shop verified successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to verify shop',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def deactivate_shop(request):
    """
    Deactivate a shop
    """
    try:
        admin_id = request.data.get('admin_id')
        shop_id = request.data.get('shop_id')
        
        if not admin_id or not shop_id:
            return Response({
                'error': 'admin_id and shop_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        shop = get_object_or_404(Shop, shop_id=shop_id)
        
        # Deactivate the shop (change status to closed)
        shop.status = 'closed'
        shop.save()
        
        # Notify shop owner
        if shop.shop_owner:
            owner_account = shop.shop_owner.shop_owner_id
            Notification.objects.create(
                receiver=owner_account,
                title='Shop Deactivated',
                message=f'Your shop "{shop.shop_name}" has been deactivated.',
                type='warning'
            )
        
        return Response({
            'message': 'Shop deactivated successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to deactivate shop',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def activate_shop(request):
    """
    Activate a shop
    """
    try:
        admin_id = request.data.get('admin_id')
        shop_id = request.data.get('shop_id')
        
        if not admin_id or not shop_id:
            return Response({
                'error': 'admin_id and shop_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        shop = get_object_or_404(Shop, shop_id=shop_id)
        
        # Activate the shop (change status to open)
        shop.status = 'open'
        shop.save()
        
        # Notify shop owner
        if shop.shop_owner:
            owner_account = shop.shop_owner.shop_owner_id
            Notification.objects.create(
                receiver=owner_account,
                title='Shop Activated',
                message=f'Your shop "{shop.shop_name}" has been activated!',
                type='info'
            )
        
        return Response({
            'message': 'Shop activated successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to activate shop',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
