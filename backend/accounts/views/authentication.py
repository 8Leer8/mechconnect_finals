from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login as django_login
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.cache import cache
import uuid
from datetime import timedelta

from ..models import Account, PasswordReset
from ..serializers import (
    UserRegistrationSerializer, UserLoginSerializer, AccountSerializer,
    PasswordChangeSerializer, PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer
)
from ..utils import send_verification_email, send_email_verification_otp, verify_email_otp, is_email_verified, send_password_reset_otp, verify_password_reset_otp, is_password_reset_verified


@api_view(['POST'])
@permission_classes([AllowAny])
def request_email_verification(request):
    """
    Request email verification OTP BEFORE user registration.
    This allows verifying email without creating a user first.
    
    Expected POST data:
        - email: Email address to verify
    
    Returns:
        - Success message if OTP sent
        - Error if email is invalid or already registered
    """
    email = request.data.get('email', '').strip().lower()
    
    # Validate email format
    if not email:
        return Response({
            'error': 'Email address is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    import re
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return Response({
            'error': 'Please enter a valid email address'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email is already registered
    if Account.objects.filter(email__iexact=email).exists():
        return Response({
            'error': 'This email is already registered. Please login or use a different email.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Send OTP
    if send_email_verification_otp(email):
        return Response({
            'message': 'Verification code sent to your email.',
            'email': email
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Failed to send verification code. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user account with role-based profile creation.
    Email must be verified BEFORE registration (pre-registration verification).
    """
    email = request.data.get('email', '').strip().lower()
    email_verified = request.data.get('email_verified', False)
    
    # Check if email was pre-verified (new flow)
    if email_verified:
        if not is_email_verified(email):
            return Response({
                'error': 'Email not verified. Please verify your email first.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()
                
                # If email was pre-verified, mark user as active
                if email_verified and is_email_verified(email):
                    user.is_active = True
                    user.is_verified = True
                    user.save()
                    # Clear the verification cache
                    cache_key = f'email_verified_{email}'
                    cache.delete(cache_key)
                else:
                    # Old flow: Send verification email after registration
                    try:
                        send_verification_email(user, request)
                    except Exception as email_error:
                        print(f"Failed to send verification email: {str(email_error)}")
                
                user_data = AccountSerializer(user).data
                return Response({
                    'message': 'Account created successfully!',
                    'user': user_data,
                    'email_verified': email_verified,
                    'requires_verification': not email_verified,
                    'user_id': user.acc_id
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


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_code(request):
    """
    Verify email using 6-digit OTP code.
    Supports two flows:
    1. Pre-registration: Verify email before account creation (email only)
    2. Post-registration: Verify email after account creation (user_id)
    
    Expected POST data:
        - email: Email address (for pre-registration flow)
        - code: 6-digit OTP code
        OR
        - user_id: Account ID (for post-registration flow)
        - code: 6-digit OTP code
    """
    code = request.data.get('code', '').strip()
    email = request.data.get('email', '').strip().lower()
    user_id = request.data.get('user_id')
    
    # Validate code format
    if not code:
        return Response({
            'error': 'Verification code is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not code.isdigit() or len(code) != 6:
        return Response({
            'error': 'Invalid code format. Code must be 6 digits.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Pre-registration flow: Verify by email (no user exists yet)
    if email and not user_id:
        result = verify_email_otp(email, code)
        if result['success']:
            return Response({
                'message': 'Email verified successfully!',
                'email': email,
                'verified': True
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Post-registration flow: Verify by user_id (user already exists)
    if user_id:
        try:
            user = Account.objects.get(acc_id=user_id)
            
            # Check if already verified
            if user.is_active and user.is_verified:
                return Response({
                    'error': 'Account is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get OTP from cache
            cache_key = f'email_verification_{user_id}'
            stored_code = cache.get(cache_key)
            
            if not stored_code:
                return Response({
                    'error': 'Verification code has expired. Please request a new code.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify code
            if stored_code != code:
                return Response({
                    'error': 'Invalid verification code. Please check and try again.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Activate user
            user.is_active = True
            user.is_verified = True
            user.save()
            
            # Delete OTP from cache
            cache.delete(cache_key)
            
            return Response({
                'message': 'Email verified successfully! Your account is now active.',
                'user': AccountSerializer(user).data
            }, status=status.HTTP_200_OK)
            
        except Account.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Email verification error: {str(e)}")
            return Response({
                'error': 'An error occurred during verification. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Neither email nor user_id provided
    return Response({
        'error': 'Either email or user_id is required'
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_code(request):
    """
    Resend verification code to user's email.
    
    Expected POST data:
        - user_id: Account ID
    """
    user_id = request.data.get('user_id')
    
    if not user_id:
        return Response({
            'error': 'user_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get user
        user = Account.objects.get(acc_id=user_id)
        
        # Check if already verified
        if user.is_active:
            return Response({
                'error': 'Account is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Send new verification email
        if send_verification_email(user):
            return Response({
                'message': 'Verification code has been resent to your email.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send verification email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Account.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Resend verification error: {str(e)}")
        return Response({
            'error': 'An error occurred. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset OTP.
    Sends verification code to the registered email.
    
    Expected POST data:
        - email: Email address of the account
    
    Returns:
        - Success message if OTP sent
        - Error if email is not registered
    """
    email = request.data.get('email', '').strip().lower()
    
    # Validate email format
    if not email:
        return Response({
            'error': 'Email address is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    import re
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return Response({
            'error': 'Please enter a valid email address'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email is registered
    try:
        user = Account.objects.get(email__iexact=email)
    except Account.DoesNotExist:
        return Response({
            'error': 'No account found with this email address. Please check and try again.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Send password reset OTP
    if send_password_reset_otp(email):
        return Response({
            'message': 'Password reset code sent to your email.',
            'email': email
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Failed to send password reset code. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_password_reset_code(request):
    """
    Verify password reset OTP code.
    
    Expected POST data:
        - email: Email address
        - code: 6-digit OTP code
    
    Returns:
        - Success message if code is valid
        - Error if code is invalid or expired
    """
    code = request.data.get('code', '').strip()
    email = request.data.get('email', '').strip().lower()
    
    # Validate inputs
    if not email:
        return Response({
            'error': 'Email address is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not code:
        return Response({
            'error': 'Verification code is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not code.isdigit() or len(code) != 6:
        return Response({
            'error': 'Invalid code format. Code must be 6 digits.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP
    result = verify_password_reset_otp(email, code)
    if result['success']:
        return Response({
            'message': 'Code verified successfully! You can now reset your password.',
            'email': email,
            'verified': True
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': result['error']
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password after OTP verification.
    
    Expected POST data:
        - email: Email address
        - password: New password
        - password_confirm: Password confirmation
    
    Returns:
        - Success message if password reset
        - Error if verification not done or passwords don't match
    """
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    password_confirm = request.data.get('password_confirm', '')
    
    # Validate inputs
    if not email:
        return Response({
            'error': 'Email address is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not password or not password_confirm:
        return Response({
            'error': 'Password and confirmation are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if password != password_confirm:
        return Response({
            'error': 'Passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password strength
    if len(password) < 8:
        return Response({
            'error': 'Password must be at least 8 characters long'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP was verified
    if not is_password_reset_verified(email):
        return Response({
            'error': 'Please verify your email with the code first'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get user and update password
    try:
        from django.contrib.auth.hashers import make_password
        
        user = Account.objects.get(email__iexact=email)
        user.password = make_password(password)
        user.save()
        
        # Clear the verification cache
        cache_key = f'password_reset_verified_{email}'
        otp_key = f'password_reset_otp_{email}'
        cache.delete(cache_key)
        cache.delete(otp_key)
        
        return Response({
            'message': 'Password reset successfully! You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except Account.DoesNotExist:
        return Response({
            'error': 'Account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        print(f"Password reset error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return Response({
            'error': f'An error occurred while resetting password: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

