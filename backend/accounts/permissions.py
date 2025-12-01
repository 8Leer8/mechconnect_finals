from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import AccountRole

def head_admin_required(view_func):
    """
    Decorator to check if user has head_admin role
    Usage: @head_admin_required
    Note: This is designed for stateless API with user_id passed in requests
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Get user_id from request
        user_id = request.GET.get('user_id') or request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'Authentication required',
                'details': 'user_id is required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Verify user exists and is active
        try:
            from .models import Account
            user = Account.objects.get(acc_id=user_id)
            
            if not user.is_active:
                return Response({
                    'error': 'Account is inactive',
                    'details': 'This account has been deactivated'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if user is banned
            if hasattr(user, 'ban'):
                return Response({
                    'error': 'Account is banned',
                    'details': user.ban.reason_ban
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if user has head_admin role
            has_head_admin = AccountRole.objects.filter(
                acc_id=user_id,
                account_role=AccountRole.ROLE_HEAD_ADMIN
            ).exists()
            
            if not has_head_admin:
                return Response({
                    'error': 'Permission denied',
                    'details': 'Head admin access required'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Store user_id in request for easy access
            request.head_admin_id = user_id
            
        except Account.DoesNotExist:
            return Response({
                'error': 'User not found',
                'details': 'Invalid user_id'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Authentication failed',
                'details': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def admin_or_head_admin_required(view_func):
    """
    Decorator to check if user has admin or head_admin role
    Usage: @admin_or_head_admin_required
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_id = request.GET.get('user_id') or request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'Authentication required',
                'details': 'user_id is required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            has_permission = AccountRole.objects.filter(
                acc_id=user_id,
                account_role__in=[AccountRole.ROLE_ADMIN, AccountRole.ROLE_HEAD_ADMIN]
            ).exists()
            
            if not has_permission:
                return Response({
                    'error': 'Permission denied',
                    'details': 'Admin access required'
                }, status=status.HTTP_403_FORBIDDEN)
            
            request.admin_id = user_id
            
        except Exception as e:
            return Response({
                'error': 'Authentication failed',
                'details': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper