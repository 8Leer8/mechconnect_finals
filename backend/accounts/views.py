from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
import uuid
from datetime import datetime, timedelta

from .models import (
    Account, AccountRole, Client, Mechanic, ShopOwner, 
    Admin, HeadAdmin, PasswordReset, AccountBan
)
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, AccountSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer, NotificationSerializer, MechanicDiscoverySerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user account with role-based profile creation
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()
                user_data = AccountSerializer(user).data
                return Response({
                    'message': 'Account created successfully',
                    'user': user_data
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': 'Registration failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'error': 'Validation failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticate user and return user data
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Check if user is banned
        if hasattr(user, 'ban'):
            return Response({
                'error': 'Account is banned',
                'reason': user.ban.reason_ban
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_data = AccountSerializer(user).data
        return Response({
            'message': 'Login successful',
            'user': user_data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Login failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Get current user profile
    """
    try:
        # In a real implementation, you'd get the user from JWT token or session
        # For now, we'll get by ID from query params or use a mock user
        user_id = request.GET.get('user_id')
        if user_id:
            user = get_object_or_404(Account, acc_id=user_id)
        else:
            # Mock response - replace with actual authenticated user
            return Response({
                'error': 'User ID required in query params for this demo'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AccountSerializer(user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to fetch profile',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile information
    """
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({
                'error': 'User ID required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=user_id)
        
        # Update basic account info
        serializer = AccountSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': 'Failed to update profile',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({
                'error': 'User ID required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=user_id)
        
        # Create a mock request object for the serializer context
        mock_request = type('MockRequest', (), {'user': user})()
        serializer = PasswordChangeSerializer(
            data=request.data, 
            context={'request': mock_request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': 'Failed to change password',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Request password reset token
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        try:
            email = serializer.validated_data['email']
            user = Account.objects.get(email=email)
            
            # Generate reset token
            reset_token = str(uuid.uuid4())
            expires_at = timezone.now() + timedelta(hours=1)  # Token expires in 1 hour
            
            # Create password reset record
            PasswordReset.objects.create(
                acc=user,
                reset_token=reset_token,
                expires_at=expires_at
            )
            
            # In a real app, you would send this token via email
            # For now, we'll return it in the response (DON'T do this in production!)
            return Response({
                'message': 'Password reset token generated',
                'reset_token': reset_token,  # Remove this in production
                'note': 'In production, this token would be sent via email'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to process reset request',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'error': 'Validation failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Confirm password reset with token
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to reset password',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'error': 'Validation failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


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
        from .models import Notification
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
def health_check(request):
    """
    Health check endpoint
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'service': 'MechConnect Authentication API'
    }, status=status.HTTP_200_OK)
