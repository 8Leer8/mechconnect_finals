from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import Account, AccountRole, AccountBan, Notification
from ..serializers import AccountSerializer, NotificationSerializer, MechanicDiscoverySerializer
from ..permissions import head_admin_required


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """
    Get list of users (admin functionality)
    """
    try:
        # In production, add proper admin permission check
        users = Account.objects.all().order_by('-created_at')
        
        # Apply filters
        role = request.GET.get('role')
        if role:
            users = users.filter(roles__account_role=role)
        
        is_active = request.GET.get('is_active')
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        is_verified = request.GET.get('is_verified')
        if is_verified is not None:
            users = users.filter(is_verified=is_verified.lower() == 'true')
        
        # Pagination
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = users.count()
        users_page = users[start:end]
        
        serializer = AccountSerializer(users_page, many=True)
        
        return Response({
            'users': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch users',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    """
    Get specific user by ID
    """
    try:
        user = get_object_or_404(Account, acc_id=user_id)
        serializer = AccountSerializer(user)
        
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def deactivate_user(request, user_id):
    """
    Deactivate a user account (admin functionality)
    """
    try:
        user = get_object_or_404(Account, acc_id=user_id)
        user.is_active = False
        user.save()
        
        return Response({
            'message': f'User {user.username} has been deactivated'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to deactivate user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def activate_user(request, user_id):
    """
    Activate a user account (admin functionality)
    """
    try:
        user = get_object_or_404(Account, acc_id=user_id)
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'User {user.username} has been activated'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to activate user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def verify_user(request, user_id):
    """
    Verify a user account (admin functionality)
    """
    try:
        user = get_object_or_404(Account, acc_id=user_id)
        user.is_verified = True
        user.save()
        
        return Response({
            'message': f'User {user.username} has been verified'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to verify user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """
    Get notifications for a user
    """
    try:
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({
                'error': 'User ID required in query params'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=user_id)
        notifications = user.notifications.all().order_by('-created_at')
        
        # Filter by read status
        is_read = request.GET.get('is_read')
        if is_read is not None:
            notifications = notifications.filter(is_read=is_read.lower() == 'true')
        
        # Filter by type
        notification_type = request.GET.get('type')
        if notification_type:
            notifications = notifications.filter(type=notification_type)
        
        serializer = NotificationSerializer(notifications, many=True)
        
        return Response({
            'notifications': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch notifications',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a notification as read
    """
    try:
        from ..models import Notification
        notification = get_object_or_404(Notification, notification_id=notification_id)
        notification.is_read = True
        notification.save()
        
        return Response({
            'message': 'Notification marked as read'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to mark notification as read',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def discover_mechanics(request):
    """
    Get all available mechanics for discovery page
    """
    try:
        # Get all accounts with mechanic role
        mechanic_accounts = Account.objects.filter(
            roles__account_role=AccountRole.ROLE_MECHANIC,
            is_active=True,
            is_verified=True
        ).select_related(
            'mechanic_profile', 'address'
        ).prefetch_related('roles').order_by('-mechanic_profile__average_rating')
        
        # Apply filters if provided
        city = request.GET.get('city')
        if city:
            mechanic_accounts = mechanic_accounts.filter(
                address__city_municipality__icontains=city
            )
        
        ranking = request.GET.get('ranking')
        if ranking:
            mechanic_accounts = mechanic_accounts.filter(
                mechanic_profile__ranking=ranking
            )
        
        status_filter = request.GET.get('status')
        if status_filter:
            mechanic_accounts = mechanic_accounts.filter(
                mechanic_profile__status=status_filter
            )
        
        # Check if any mechanics found
        if not mechanic_accounts.exists():
            return Response({
                'message': 'No mechanic available',
                'mechanics': [],
                'total_count': 0
            }, status=status.HTTP_200_OK)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 10))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = mechanic_accounts.count()
        mechanics_page = mechanic_accounts[start:end]
        
        serializer = MechanicDiscoverySerializer(mechanics_page, many=True)
        
        return Response({
            'message': 'Mechanics found' if total_count > 0 else 'No mechanic available',
            'mechanics': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch mechanics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_users(request):
    """
    Get all users for head admin user management
    """
    try:
        users = Account.objects.all().prefetch_related('roles', 'ban').order_by('-created_at')
        
        users_data = []
        for user in users:
            users_data.append({
                'id': user.acc_id,
                'username': user.username,
                'email': user.email,
                'first_name': user.firstname,
                'last_name': user.lastname,
                'is_active': user.is_active,
                'is_banned': hasattr(user, 'ban'),
                'date_joined': user.created_at.isoformat(),
                'roles': [{'account_role': role.account_role} for role in user.roles.all()]
            })
        
        return Response(users_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch users',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def ban_user(request):
    """
    Ban a user account
    """
    try:
        admin_id = request.data.get('admin_id')
        user_id = request.data.get('user_id')
        
        if not admin_id or not user_id:
            return Response({
                'error': 'admin_id and user_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=user_id)
        admin = get_object_or_404(Account, acc_id=admin_id)
        
        # Check if already banned
        if hasattr(user, 'ban'):
            return Response({
                'error': 'User is already banned'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create ban record
        AccountBan.objects.create(
            acc_ban_id=user,
            reason_ban='Banned by head admin'
        )
        
        return Response({
            'message': 'User banned successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to ban user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def unban_user(request):
    """
    Unban a user account
    """
    try:
        admin_id = request.data.get('admin_id')
        user_id = request.data.get('user_id')
        
        if not admin_id or not user_id:
            return Response({
                'error': 'admin_id and user_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=user_id)
        
        # Check if not banned
        if not hasattr(user, 'ban'):
            return Response({
                'error': 'User is not banned'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete ban record
        user.ban.delete()
        
        return Response({
            'message': 'User unbanned successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to unban user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def mechanic_detail(request, mechanic_id):
    """
    Get detailed information about a specific mechanic
    """
    try:
        # Get the mechanic account
        mechanic_account = Account.objects.select_related(
            'mechanic_profile', 'address'
        ).prefetch_related(
            'roles', 'mechanic_profile__specialties'
        ).get(
            acc_id=mechanic_id,
            roles__account_role=AccountRole.ROLE_MECHANIC,
            is_active=True
        )
        
        # Get mechanic profile
        mechanic_profile = mechanic_account.mechanic_profile
        
        # Prepare full name early since it's used in multiple places
        full_name_parts = [mechanic_account.firstname, mechanic_account.middlename, mechanic_account.lastname]
        full_name = ' '.join(part for part in full_name_parts if part)
        
        # Get location from address
        location = "Location not specified"
        if hasattr(mechanic_account, 'address') and mechanic_account.address:
            address_parts = []
            if mechanic_account.address.city_municipality:
                address_parts.append(mechanic_account.address.city_municipality)
            if mechanic_account.address.province:
                address_parts.append(mechanic_account.address.province)
            location = ", ".join(address_parts) if address_parts else "Location not specified"
        
        # Get specialties through the intermediate model
        specialties = []
        if mechanic_profile:
            from specialties.models import MechanicSpecialty
            mechanic_specialties = MechanicSpecialty.objects.filter(
                mechanic=mechanic_profile
            ).select_related('specialty')
            specialties = [ms.specialty.name for ms in mechanic_specialties]
        
        # Get mechanic's services based on whether they work for a shop or are independent
        from services.models import Service, MechanicService, ShopService, ShopServiceMechanic
        from shop.models import Shop
        
        services_data = []
        shop_info = None
        
        if mechanic_profile and mechanic_profile.is_working_for_shop and mechanic_profile.shop:
            # Mechanic works for a shop - get services assigned to this mechanic by the shop
            shop = mechanic_profile.shop
            shop_info = {
                'shop_id': shop.shop_id,
                'shop_name': shop.shop_name,
                'description': shop.description,
                'service_banner': shop.service_banner,
            }
            
            # Get shop services assigned to this mechanic
            shop_service_mechanic_assignments = ShopServiceMechanic.objects.filter(
                mechanic=mechanic_profile
            ).select_related('shop_service__service__service_category')
            
            for assignment in shop_service_mechanic_assignments:
                service = assignment.shop_service.service
                services_data.append({
                    'service_id': service.service_id,
                    'name': service.name,
                    'description': service.description,
                    'price': str(service.price),
                    'service_banner': service.service_banner,
                    'category_name': service.service_category.name if service.service_category else 'Service',
                    'provider_type': 'Shop',
                    'provider_name': shop.shop_name,
                    'provider_id': shop.shop_id,
                    'average_rating': '4.5',  # Calculate this based on actual ratings later
                    'total_bookings': 50,  # Calculate this based on actual bookings later
                })
        else:
            # Independent mechanic - get their own services
            mechanic_service_ids = MechanicService.objects.filter(
                mechanic=mechanic_profile
            ).values_list('service_id', flat=True)
            
            services = Service.objects.filter(
                service_id__in=mechanic_service_ids
            ).select_related('service_category')[:10]  # Limit to 10 services
            
            for service in services:
                services_data.append({
                    'service_id': service.service_id,
                    'name': service.name,
                    'description': service.description,
                    'price': str(service.price),
                    'service_banner': service.service_banner,
                    'category_name': service.service_category.name if service.service_category else 'Service',
                    'provider_type': 'Independent Mechanic',
                    'provider_name': full_name,
                    'provider_id': mechanic_account.acc_id,
                    'average_rating': '4.5',  # Calculate this based on actual ratings later
                    'total_bookings': 50,  # Calculate this based on actual bookings later
                })
        
        # Prepare response data
        mechanic_data = {
            'acc_id': mechanic_account.acc_id,
            'full_name': full_name,
            'email': mechanic_account.email,
            'profile_photo': mechanic_profile.profile_photo if mechanic_profile else None,
            'contact_number': mechanic_profile.contact_number if mechanic_profile else None,
            'bio': mechanic_profile.bio if mechanic_profile else 'Professional mechanic',
            'average_rating': str(mechanic_profile.average_rating) if mechanic_profile and mechanic_profile.average_rating else '0.0',
            'ranking': mechanic_profile.ranking if mechanic_profile else 'standard',
            'location': location,
            'total_jobs': 0,  # This field doesn't exist in the model, set to 0 for now
            'date_joined': mechanic_account.created_at.strftime('%B %Y') if mechanic_account.created_at else 'Recently',
            'status': mechanic_profile.status if mechanic_profile else 'available',
            'is_working_for_shop': mechanic_profile.is_working_for_shop if mechanic_profile else False,
            'shop_info': shop_info,
            'specialties': specialties,
            'services': services_data,
        }
        
        return Response({
            'message': 'Mechanic details retrieved successfully',
            'mechanic': mechanic_data
        }, status=status.HTTP_200_OK)
        
    except Account.DoesNotExist:
        return Response({
            'error': 'Mechanic not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'An error occurred: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_client_address(request, client_id):
    """
    Get saved address for a specific client
    """
    try:
        from ..models import Client, AccountAddress
        
        # Check if client exists
        try:
            client = Client.objects.get(client_id=client_id)
        except Client.DoesNotExist:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Try to get client address
        try:
            address = AccountAddress.objects.get(acc_add_id=client.client_id)
            address_data = {
                'house_building_number': address.house_building_number or '',
                'street_name': address.street_name or '',
                'subdivision_village': address.subdivision_village or '',
                'barangay': address.barangay or '',
                'city_municipality': address.city_municipality or '',
                'province': address.province or '',
                'region': address.region or '',
                'postal_code': address.postal_code or ''
            }
            
            return Response({
                'message': 'Address found',
                'address': address_data
            }, status=status.HTTP_200_OK)
            
        except AccountAddress.DoesNotExist:
            return Response({
                'message': 'No saved address',
                'address': None
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to get client address',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
