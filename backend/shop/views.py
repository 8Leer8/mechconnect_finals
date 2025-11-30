from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Shop, ShopMechanic
from .serializers import ShopDiscoverySerializer


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
