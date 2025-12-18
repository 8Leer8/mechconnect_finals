from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Shop, ShopMechanic, ShopItem
from .serializers import ShopDiscoverySerializer, ShopItemSerializer
from services.models import Service, ShopServiceMechanic
from services.serializers import ServiceDiscoverySerializer
from accounts.models import Mechanic, Account, Notification
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


@api_view(['POST'])
@permission_classes([AllowAny])
def invite_mechanic(request):
    """
    Invite a mechanic to join a shop
    """
    try:
        mechanic_id = request.data.get('mechanic_id')
        shop_id = request.data.get('shop_id')
        
        if not mechanic_id or not shop_id:
            return Response({
                'error': 'Missing required fields',
                'message': 'Both mechanic_id and shop_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get shop and mechanic
        shop = get_object_or_404(Shop, shop_id=shop_id)
        mechanic_account = get_object_or_404(Account, acc_id=mechanic_id)
        mechanic = get_object_or_404(Mechanic, mechanic_id=mechanic_account)
        
        # Check if mechanic is already in the shop
        existing_membership = ShopMechanic.objects.filter(
            shop=shop,
            mechanic=mechanic
        ).first()
        
        if existing_membership:
            return Response({
                'error': 'Mechanic already in shop',
                'message': 'This mechanic is already a member of this shop'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create shop mechanic relationship
        shop_mechanic = ShopMechanic.objects.create(
            shop=shop,
            mechanic=mechanic,
            date_joined=timezone.now().date()
        )
        
        # Get shop owner name for notification
        shop_owner_name = 'a shop owner'
        try:
            if shop.shop_owner and hasattr(shop.shop_owner, 'shop_owner_id'):
                owner_account = shop.shop_owner.shop_owner_id
                if owner_account:
                    full_name = f"{owner_account.firstname or ''} {owner_account.lastname or ''}".strip()
                    if full_name:
                        shop_owner_name = full_name
                    elif owner_account.username:
                        shop_owner_name = owner_account.username
        except Exception as e:
            # If we can't get shop owner name, use default
            print(f"Warning: Could not get shop owner name: {e}")
        
        # Create notification for the mechanic
        notification_created = False
        try:
            notification = Notification.objects.create(
                receiver=mechanic_account,
                title='Shop Invitation',
                message=f'You have been invited to join {shop.shop_name} by {shop_owner_name}. Welcome to the team!',
                type='info',
                is_read=False
            )
            # Verify notification was created
            notification.refresh_from_db()
            if notification.notification_id:
                notification_created = True
                print(f"Notification created successfully: ID {notification.notification_id} for mechanic {mechanic_account.acc_id}")
                # Verify it can be retrieved
                verify_notif = Notification.objects.filter(
                    receiver=mechanic_account,
                    notification_id=notification.notification_id
                ).first()
                if verify_notif:
                    print(f"Notification verified: Found in database for mechanic {mechanic_account.acc_id}")
                else:
                    print(f"WARNING: Notification created but not found in database for mechanic {mechanic_account.acc_id}")
            else:
                print(f"ERROR: Notification created but has no ID for mechanic {mechanic_account.acc_id}")
        except Exception as notif_error:
            # Log error but don't fail the invitation
            print(f"ERROR creating notification: {notif_error}")
            print(f"Mechanic account ID: {mechanic_account.acc_id}")
            print(f"Mechanic account type: {type(mechanic_account)}")
            import traceback
            traceback.print_exc()
        
        return Response({
            'message': 'Mechanic invited successfully',
            'shop_mechanic_id': shop_mechanic.shop_mechanic_id,
            'shop_id': shop.shop_id,
            'mechanic_id': mechanic_id,
            'notification_sent': notification_created
        }, status=status.HTTP_201_CREATED)
        
    except Shop.DoesNotExist:
        return Response({
            'error': 'Shop not found',
            'message': f'Shop with ID {shop_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Account.DoesNotExist:
        return Response({
            'error': 'Mechanic account not found',
            'message': f'Mechanic account with ID {mechanic_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Mechanic.DoesNotExist:
        return Response({
            'error': 'Mechanic profile not found',
            'message': f'Mechanic profile for account ID {mechanic_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'error': 'Failed to invite mechanic',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_shop_items(request):
    """
    Get all items for a specific shop
    """
    try:
        shop_id = request.GET.get('shop_id')
        
        if not shop_id:
            return Response({
                'error': 'Missing required parameter',
                'message': 'shop_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get shop
        shop = get_object_or_404(Shop, shop_id=shop_id)
        
        # Get all items for this shop
        items = ShopItem.objects.filter(shop=shop).order_by('-created_at')
        
        serializer = ShopItemSerializer(items, many=True)
        
        return Response({
            'message': 'Items retrieved successfully',
            'items': serializer.data,
            'total_count': len(serializer.data)
        }, status=status.HTTP_200_OK)
        
    except Shop.DoesNotExist:
        return Response({
            'error': 'Shop not found',
            'message': f'Shop with ID {shop_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch items',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def add_shop_item(request):
    """
    Add a new item to a shop
    """
    try:
        shop_id = request.data.get('shop_id')
        item_name = request.data.get('item_name')
        category = request.data.get('category')
        price = request.data.get('price')
        stock = request.data.get('stock')
        description = request.data.get('description', '')
        
        # Validate required fields
        if not all([shop_id, item_name, category, price is not None, stock is not None]):
            return Response({
                'error': 'Missing required fields',
                'message': 'shop_id, item_name, category, price, and stock are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get shop
        shop = get_object_or_404(Shop, shop_id=shop_id)
        
        # Create shop item
        shop_item = ShopItem.objects.create(
            shop=shop,
            item_name=item_name,
            category=category,
            price=price,
            stock=stock,
            description=description if description else None
        )
        
        serializer = ShopItemSerializer(shop_item)
        
        return Response({
            'message': 'Item added successfully',
            'item': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Shop.DoesNotExist:
        return Response({
            'error': 'Shop not found',
            'message': f'Shop with ID {shop_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'error': 'Failed to add item',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_shop_item(request, item_id):
    """
    Update an existing shop item
    """
    try:
        item = get_object_or_404(ShopItem, item_id=item_id)
        
        # Get update data
        item_name = request.data.get('item_name')
        category = request.data.get('category')
        price = request.data.get('price')
        stock = request.data.get('stock')
        description = request.data.get('description')
        
        # Update fields if provided
        if item_name is not None:
            item.item_name = item_name
        if category is not None:
            item.category = category
        if price is not None:
            item.price = price
        if stock is not None:
            item.stock = stock
        if description is not None:
            item.description = description if description else None
        
        item.save()
        
        serializer = ShopItemSerializer(item)
        
        return Response({
            'message': 'Item updated successfully',
            'item': serializer.data
        }, status=status.HTTP_200_OK)
        
    except ShopItem.DoesNotExist:
        return Response({
            'error': 'Item not found',
            'message': f'Item with ID {item_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'error': 'Failed to update item',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_shop_item(request, item_id):
    """
    Delete a shop item
    """
    try:
        item = get_object_or_404(ShopItem, item_id=item_id)
        item_name = item.item_name
        item.delete()
        
        return Response({
            'message': 'Item deleted successfully',
            'deleted_item_name': item_name
        }, status=status.HTTP_200_OK)
        
    except ShopItem.DoesNotExist:
        return Response({
            'error': 'Item not found',
            'message': f'Item with ID {item_id} does not exist'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'error': 'Failed to delete item',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
