"""
Custom JWT Authentication Backend for Account Model

This authentication backend allows SimpleJWT to work with the custom
Account model (which is not a Django User model) by overriding the
get_user method to query Account instead of AUTH_USER_MODEL.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings

from .models import Account


class AccountJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that uses the Account model instead of Django's User model.
    
    This is necessary because Account is a custom model (not extending AbstractUser)
    and cannot be set as AUTH_USER_MODEL.
    """
    
    def get_user(self, validated_token):
        """
        Retrieve Account instance from the validated JWT token.
        
        Overrides the default behavior to query Account model using acc_id
        instead of querying AUTH_USER_MODEL with the default user ID field.
        """
        try:
            # Get the user ID field name from settings (defaults to 'acc_id')
            user_id_field = settings.SIMPLE_JWT.get('USER_ID_FIELD', 'acc_id')
            user_id_claim = settings.SIMPLE_JWT.get('USER_ID_CLAIM', 'acc_id')
            
            # Extract user ID from token
            user_id = validated_token.get(user_id_claim)
            
            if user_id is None:
                raise InvalidToken('Token contained no recognizable user identification')
            
            # Query Account model using acc_id
            try:
                user = Account.objects.get(**{user_id_field: user_id})
            except Account.DoesNotExist:
                raise AuthenticationFailed('User not found', code='user_not_found')
            
            # Check if user is active
            if not user.is_active:
                raise AuthenticationFailed('User is inactive', code='user_inactive')
            
            return user
            
        except Exception as e:
            raise InvalidToken(f'Token authentication failed: {str(e)}')
