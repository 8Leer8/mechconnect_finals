from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum

from ..models import Account, AccountRole, TokenPurchase
from payment.models import TokenPackage


@api_view(['GET'])
@permission_classes([AllowAny])
def get_token_purchases(request):
    """
    Get all token purchases for head admin
    """
    try:
        purchases = TokenPurchase.objects.all().select_related('account').order_by('-purchased_at')
        
        purchases_data = []
        for purchase in purchases:
            # Get user type from AccountRole
            user_roles = AccountRole.objects.filter(acc=purchase.account).values_list('account_role', flat=True)
            user_type = 'client'  # default
            if 'mechanic' in user_roles:
                user_type = 'mechanic'
            elif 'shop_owner' in user_roles:
                user_type = 'shop_owner'
            
            purchases_data.append({
                'id': purchase.token_purchase_id,
                'user_id': purchase.account.acc_id,
                'username': purchase.account.username,
                'user_email': purchase.account.email,
                'user_type': user_type,
                'full_name': f"{purchase.account.firstname} {purchase.account.lastname}",
                'tokens_amount': purchase.tokens_amount,
                'price': str(purchase.price),
                'payment_method': purchase.payment_method or 'N/A',
                'status': purchase.status or 'completed',
                'purchased_at': purchase.purchased_at.isoformat()
            })
        
        return Response(purchases_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch token purchases',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def manage_token_pricing(request, package_id=None):
    """
    Manage token pricing packages - CRUD operations
    """
    try:
        if request.method == 'GET':
            # Get all token packages
            packages = TokenPackage.objects.all().order_by('-is_featured', 'tokens')
            
            packages_data = []
            for pkg in packages:
                packages_data.append({
                    'id': pkg.package_id,
                    'name': pkg.name,
                    'tokens': pkg.tokens,
                    'price': float(pkg.price),
                    'discount_percentage': float(pkg.discount_percentage),
                    'is_active': pkg.is_active,
                    'is_featured': pkg.is_featured,
                    'description': pkg.description
                })
            
            # Get stats
            total_sales = TokenPurchase.objects.filter(status='completed').count()
            total_revenue = TokenPurchase.objects.filter(status='completed').aggregate(
                total=Sum('price')
            )['total'] or 0
            
            stats = {
                'total_packages': packages.count(),
                'active_packages': packages.filter(is_active=True).count(),
                'total_sales': total_sales,
                'total_revenue': str(total_revenue)
            }
            
            return Response({
                'packages': packages_data,
                'stats': stats
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            # Create new token package
            name = request.data.get('name')
            tokens = request.data.get('tokens')
            price = request.data.get('price')
            discount_percentage = request.data.get('discount_percentage', 0)
            is_active = request.data.get('is_active', True)
            is_featured = request.data.get('is_featured', False)
            description = request.data.get('description', '')
            
            if not all([name, tokens, price]):
                return Response({
                    'error': 'Name, tokens, and price are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            package = TokenPackage.objects.create(
                name=name,
                tokens=tokens,
                price=price,
                discount_percentage=discount_percentage,
                is_active=is_active,
                is_featured=is_featured,
                description=description
            )
            
            return Response({
                'message': 'Token package created successfully',
                'package_id': package.package_id
            }, status=status.HTTP_201_CREATED)
        
        elif request.method == 'PUT':
            # Update token package
            if not package_id:
                return Response({
                    'error': 'Package ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            from django.shortcuts import get_object_or_404
            package = get_object_or_404(TokenPackage, package_id=package_id)
            
            # Update fields
            if 'name' in request.data:
                package.name = request.data['name']
            if 'tokens' in request.data:
                package.tokens = request.data['tokens']
            if 'price' in request.data:
                package.price = request.data['price']
            if 'discount_percentage' in request.data:
                package.discount_percentage = request.data['discount_percentage']
            if 'is_active' in request.data:
                package.is_active = request.data['is_active']
            if 'is_featured' in request.data:
                package.is_featured = request.data['is_featured']
            if 'description' in request.data:
                package.description = request.data['description']
            
            package.save()
            
            return Response({
                'message': 'Token package updated successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'DELETE':
            # Delete token package
            if not package_id:
                return Response({
                    'error': 'Package ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            from django.shortcuts import get_object_or_404
            package = get_object_or_404(TokenPackage, package_id=package_id)
            package.delete()
            
            return Response({
                'message': 'Token package deleted successfully'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to manage token pricing',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
