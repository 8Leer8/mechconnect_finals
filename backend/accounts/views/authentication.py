from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login as django_login
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
import uuid
from datetime import timedelta

from ..models import Account, PasswordReset
from ..serializers import (
    UserRegistrationSerializer, UserLoginSerializer, AccountSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer
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
@permission_classes([AllowAny])
def check_user_roles(request):
    """
    Check if a user has mechanic or shop owner profiles registered
    """
    try:
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({
                'error': 'User ID required in query parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=user_id)
        
        # Check if user has different role profiles
        has_mechanic = hasattr(user, 'mechanic_profile') and user.mechanic_profile is not None
        has_shop_owner = hasattr(user, 'shop_owner_profile') and user.shop_owner_profile is not None
        
        # Get role information
        roles = user.roles.all()
        role_list = [role.account_role for role in roles]
        
        return Response({
            'user_id': user.acc_id,
            'full_name': f"{user.firstname} {user.lastname}",
            'has_mechanic_profile': has_mechanic,
            'has_shop_owner_profile': has_shop_owner,
            'roles': role_list,
            'mechanic_status': {
                'registered': has_mechanic,
                'verified': user.mechanic_profile.is_verified if has_mechanic else False,
                'status': user.mechanic_profile.status if has_mechanic else None
            } if has_mechanic else {
                'registered': False,
                'verified': False,
                'status': None
            },
            'shop_owner_status': {
                'registered': has_shop_owner,
                'verified': user.shop_owner_profile.is_verified if has_shop_owner else False,
                'status': user.shop_owner_profile.status if has_shop_owner else None
            } if has_shop_owner else {
                'registered': False,
                'verified': False,
                'status': None
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to check user roles',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
