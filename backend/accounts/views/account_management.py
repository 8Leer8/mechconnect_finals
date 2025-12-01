from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404

from ..models import Account, AccountRole, Admin


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def manage_admin_accounts(request, admin_id=None):
    """
    Manage admin accounts - CRUD operations
    """
    try:
        if request.method == 'GET':
            # Get all admin accounts
            admins = Account.objects.filter(
                roles__account_role='admin'
            ).prefetch_related('roles').order_by('-created_at')
            
            admin_data = []
            for admin in admins:
                # Get admin profile
                try:
                    admin_profile = Admin.objects.get(admin_id=admin.acc_id)
                    created_by_name = None
                    if admin_profile.created_by_admin:
                        created_by_name = admin_profile.created_by_admin.username
                    
                    admin_data.append({
                        'id': admin.acc_id,
                        'username': admin.username,
                        'email': admin.email,
                        'first_name': admin.firstname,
                        'last_name': admin.lastname,
                        'is_active': admin.is_active,
                        'created_at': admin.created_at.isoformat(),
                        'created_by': created_by_name,
                        'permissions': admin_profile.permissions if admin_profile.permissions else []
                    })
                except Admin.DoesNotExist:
                    continue
            
            return Response(admin_data, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            # Create new admin account
            username = request.data.get('username')
            email = request.data.get('email')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            password = request.data.get('password')
            is_active = request.data.get('is_active', True)
            created_by_id = request.data.get('created_by_id')
            permissions = request.data.get('permissions', [])
            
            if not all([username, email, first_name, last_name, password]):
                return Response({
                    'error': 'All required fields must be provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if username or email already exists
            if Account.objects.filter(username=username).exists():
                return Response({
                    'error': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if Account.objects.filter(email=email).exists():
                return Response({
                    'error': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                # Create account
                from django.contrib.auth.hashers import make_password
                new_admin_account = Account.objects.create(
                    username=username,
                    email=email,
                    firstname=first_name,
                    lastname=last_name,
                    password=make_password(password),
                    is_active=is_active,
                    is_verified=True
                )
                
                # Create admin role
                AccountRole.objects.create(
                    acc=new_admin_account,
                    account_role='admin'
                )
                
                # Create admin profile
                creator = None
                if created_by_id:
                    try:
                        creator = Account.objects.get(acc_id=created_by_id)
                    except Account.DoesNotExist:
                        pass
                
                Admin.objects.create(
                    admin_id=new_admin_account,
                    created_by_admin=creator,
                    permissions=permissions if permissions else []
                )
                
                return Response({
                    'message': 'Admin account created successfully',
                    'admin_id': new_admin_account.acc_id
                }, status=status.HTTP_201_CREATED)
        
        elif request.method == 'PUT':
            # Update admin account
            if not admin_id:
                return Response({
                    'error': 'Admin ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            admin_account = get_object_or_404(Account, acc_id=admin_id)
            
            # Update account fields
            if 'email' in request.data:
                admin_account.email = request.data['email']
            if 'first_name' in request.data:
                admin_account.firstname = request.data['first_name']
            if 'last_name' in request.data:
                admin_account.lastname = request.data['last_name']
            if 'is_active' in request.data:
                admin_account.is_active = request.data['is_active']
            if 'password' in request.data and request.data['password']:
                from django.contrib.auth.hashers import make_password
                admin_account.password = make_password(request.data['password'])
            
            admin_account.save()
            
            # Update admin profile permissions
            if 'permissions' in request.data:
                try:
                    admin_profile = Admin.objects.get(admin_id=admin_id)
                    admin_profile.permissions = request.data['permissions']
                    admin_profile.save()
                except Admin.DoesNotExist:
                    pass
            
            return Response({
                'message': 'Admin account updated successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'DELETE':
            # Delete admin account
            if not admin_id:
                return Response({
                    'error': 'Admin ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            admin_account = get_object_or_404(Account, acc_id=admin_id)
            admin_account.delete()
            
            return Response({
                'message': 'Admin account deleted successfully'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to manage admin accounts',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_admin_active(request, admin_id):
    """
    Toggle admin account active status
    """
    try:
        admin_account = get_object_or_404(Account, acc_id=admin_id)
        is_active = request.data.get('is_active')
        
        admin_account.is_active = is_active
        admin_account.save()
        
        return Response({
            'message': 'Admin status updated successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to toggle admin status',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
