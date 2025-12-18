from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Request, CustomRequest, QuotedRequestItem, DirectRequest, EmergencyRequest
from .serializers import (
    RequestSerializer, CreateCustomRequestSerializer, RequestListSerializer,
    CustomRequestSerializer, DirectRequestSerializer, EmergencyRequestSerializer,
    CreateDirectRequestQuotationSerializer
)
from accounts.models import Account, Client, AccountAddress, Mechanic
from bookings.models import Booking


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def create_custom_request(request):
    """
    Create a new custom request
    """
    try:
        print(f"Received request data: {request.data}")
        
        serializer = CreateCustomRequestSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            data = serializer.validated_data
            
            # Get the client
            try:
                client = Client.objects.get(client_id=data['client_id'])
            except Client.DoesNotExist:
                return Response({
                    'error': 'Client not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get provider if specified
            provider = None
            if data.get('provider_id'):
                try:
                    provider = Account.objects.get(acc_id=data['provider_id'])
                except Account.DoesNotExist:
                    return Response({
                        'error': 'Provider not found'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Create the main request
            main_request = Request.objects.create(
                client=client,
                provider=provider,
                request_type='custom',
                request_status='pending'
            )
            
            # Create the custom request details
            custom_request = CustomRequest.objects.create(
                request=main_request,
                description=data['description'],
                concern_picture=data.get('concern_picture', '')
            )
            
            # Update or create client address if location data provided
            address_fields = [
                'house_building_number', 'street_name', 'subdivision_village',
                'barangay', 'city_municipality', 'province', 'region', 'postal_code'
            ]
            
            address_data = {field: data.get(field, '') for field in address_fields}
            if any(address_data.values()):  # If any address field has data
                address, created = AccountAddress.objects.get_or_create(
                    acc_add_id=client.client_id,
                    defaults=address_data
                )
                if not created:
                    # Update existing address
                    for field, value in address_data.items():
                        if value:  # Only update if new value is provided
                            setattr(address, field, value)
                    address.save()
            
            # Return the created request
            request_serializer = RequestSerializer(main_request)
            
            return Response({
                'message': 'Custom request created successfully',
                'request': request_serializer.data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'error': 'Failed to create request',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def get_client_requests(request):
    """
    Get all requests for a specific client
    """
    try:
        client_id = request.GET.get('client_id')
        if not client_id:
            return Response({
                'error': 'Client ID required in query parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the client
        try:
            client = Client.objects.get(client_id=client_id)
        except Client.DoesNotExist:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all requests for this client
        requests = Request.objects.filter(
            client=client
        ).select_related(
            'provider', 'client__client_id'
        ).prefetch_related(
            'custom_request', 'direct_request', 'emergency_request'
        ).order_by('-created_at')
        
        # Apply status filter if provided
        status_filter = request.GET.get('status')
        if status_filter:
            requests = requests.filter(request_status=status_filter)
        
        # Apply type filter if provided
        type_filter = request.GET.get('type')
        if type_filter:
            requests = requests.filter(request_type=type_filter)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 10))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = requests.count()
        requests_page = requests[start:end]
        
        serializer = RequestListSerializer(requests_page, many=True)
        
        return Response({
            'message': 'Requests retrieved successfully',
            'requests': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to retrieve requests',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def get_request_detail(request, request_id):
    """
    Get detailed information about a specific request
    """
    try:
        # Get the request with all related data
        req = Request.objects.select_related(
            'client__client_id', 'provider'
        ).prefetch_related(
            'custom_request__quoted_items',
            'direct_request__service',
            'emergency_request'
        ).get(request_id=request_id)
        
        serializer = RequestSerializer(req)
        
        return Response({
            'message': 'Request details retrieved successfully',
            'request': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Request.DoesNotExist:
        return Response({
            'error': 'Request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to retrieve request details',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def update_request_status(request, request_id):
    """
    Update the status of a request
    """
    try:
        req = get_object_or_404(Request, request_id=request_id)
        
        new_status = request.data.get('status')
        if not new_status:
            return Response({
                'error': 'Status is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate status
        valid_statuses = ['pending', 'qouted', 'accepted', 'rejected']
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        req.request_status = new_status
        req.save()
        
        serializer = RequestSerializer(req)
        
        return Response({
            'message': 'Request status updated successfully',
            'request': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to update request status',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def delete_request(request, request_id):
    """
    Delete a request (only if status is pending)
    """
    try:
        req = get_object_or_404(Request, request_id=request_id)
        
        # Only allow deletion of pending requests
        if req.request_status != 'pending':
            return Response({
                'error': 'Only pending requests can be deleted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        req.delete()
        
        return Response({
            'message': 'Request deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to delete request',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def get_provider_requests(request):
    """
    Get all requests assigned to a specific provider (mechanic/shop)
    """
    try:
        provider_id = request.GET.get('provider_id')
        if not provider_id:
            return Response({
                'error': 'Provider ID required in query parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the provider
        try:
            provider = Account.objects.get(acc_id=provider_id)
        except Account.DoesNotExist:
            return Response({
                'error': 'Provider not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get all requests for this provider
        requests = Request.objects.filter(
            provider=provider
        ).select_related(
            'client__client_id', 'provider'
        ).prefetch_related(
            'custom_request', 'direct_request', 'emergency_request'
        ).order_by('-created_at')
        
        # Apply status filter if provided
        status_filter = request.GET.get('status')
        if status_filter:
            requests = requests.filter(request_status=status_filter)
        
        # Pagination
        page_size = int(request.GET.get('page_size', 10))
        page = int(request.GET.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = requests.count()
        requests_page = requests[start:end]
        
        serializer = RequestListSerializer(requests_page, many=True)
        
        return Response({
            'message': 'Provider requests retrieved successfully',
            'requests': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to retrieve provider requests',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def assign_provider_to_request(request, request_id):
    """
    Assign a provider to a request
    """
    try:
        req = get_object_or_404(Request, request_id=request_id)
        
        provider_id = request.data.get('provider_id')
        if not provider_id:
            return Response({
                'error': 'Provider ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the provider
        try:
            provider = Account.objects.get(acc_id=provider_id)
        except Account.DoesNotExist:
            return Response({
                'error': 'Provider not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        req.provider = provider
        req.request_status = 'accepted'  # Automatically set to accepted when assigned
        req.save()
        
        serializer = RequestSerializer(req)
        
        return Response({
            'message': 'Provider assigned successfully',
            'request': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to assign provider',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    return Response({'message': 'Request deleted successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mechanic_available_requests(request):
    """
    Get available requests for the authenticated mechanic.
    Available = requests that are quoted/accepted but not yet booked.
    Uses JWT authentication - no mechanic_id parameter needed.
    Returns empty list if user has no mechanic profile.
    """
    # Get the authenticated user
    user = request.user
    
    # Check if user has a mechanic profile
    try:
        mechanic = Mechanic.objects.get(mechanic_id=user.acc_id)
    except Mechanic.DoesNotExist:
        # User has no mechanic profile, return empty list
        return Response({
            'jobs': [],
            'total': 0,
            'message': 'User has no mechanic profile'
        }, status=status.HTTP_200_OK)
    
    # Get requests that are assigned to this mechanic and are quoted/accepted but not booked
    requests_queryset = Request.objects.filter(
        provider=user.acc_id,
        request_status__in=['quoted', 'accepted']
    ).exclude(
        # Exclude requests that already have bookings
        request_id__in=Booking.objects.values_list('request_id', flat=True)
    ).select_related(
        'client',
        'client__client_id'
    ).prefetch_related(
        'custom_request',
        'direct_request',
        'emergency_request'
    ).order_by('-created_at')
    
    # Serialize the requests
    serializer = RequestListSerializer(requests_queryset, many=True)
    return Response({
        'jobs': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mechanic_pending_requests(request):
    """
    Get pending requests for the authenticated mechanic.
    Pending = requests specifically assigned to this mechanic that are awaiting response.
    Uses JWT authentication - no mechanic_id parameter needed.
    Returns empty list if user has no mechanic profile.
    """
    # Get the authenticated user
    user = request.user
    
    # Check if user has a mechanic profile
    try:
        mechanic = Mechanic.objects.get(mechanic_id=user.acc_id)
    except Mechanic.DoesNotExist:
        # User has no mechanic profile, return empty list
        return Response({
            'jobs': [],
            'total': 0,
            'message': 'User has no mechanic profile'
        }, status=status.HTTP_200_OK)
    
    # Get pending requests assigned to this mechanic
    requests_queryset = Request.objects.filter(
        provider=user.acc_id,
        request_status='pending'
    ).select_related(
        'client',
        'client__client_id'
    ).prefetch_related(
        'custom_request',
        'direct_request',
        'emergency_request'
    ).order_by('-created_at')
    
    # Serialize the requests
    serializer = RequestListSerializer(requests_queryset, many=True)
    return Response({
        'jobs': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_request(request, request_id):
    """
    Accept a request as a mechanic.
    - Validates user is authenticated
    - Validates user has mechanic role
    - Validates request is in pending/quoted state
    - Assigns request to the mechanic
    - Updates request status to accepted
    - Creates a booking for the accepted request
    """
    try:
        # Get the authenticated user
        user = request.user
        
        # Check if user has a mechanic profile
        try:
            mechanic = Mechanic.objects.get(mechanic_id=user.acc_id)
        except Mechanic.DoesNotExist:
            return Response({
                'error': 'Access denied. User is not a mechanic.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the request
        try:
            req = Request.objects.select_related(
                'client', 'provider'
            ).prefetch_related(
                'custom_request', 'direct_request', 'emergency_request'
            ).get(request_id=request_id)
        except Request.DoesNotExist:
            return Response({
                'error': 'Request not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate request state - only pending or quoted requests can be accepted
        if req.request_status not in ['pending', 'qouted']:
            return Response({
                'error': f'Cannot accept request. Current status is "{req.request_status}". Only pending or quoted requests can be accepted.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if request is already assigned to another mechanic
        if req.provider and req.provider.acc_id != user.acc_id:
            return Response({
                'error': 'This request is already assigned to another mechanic.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if booking already exists for this request
        existing_booking = Booking.objects.filter(request=req).first()
        if existing_booking:
            return Response({
                'error': 'A booking already exists for this request.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use transaction to ensure atomicity
        with transaction.atomic():
            # Assign mechanic to request and update status
            req.provider = user
            req.request_status = 'accepted'
            req.save()
            
            # Create a booking for this accepted request
            booking = Booking.objects.create(
                request=req,
                status='active',
                amount_fee=0  # Will be updated later with actual fee
            )
            
            # Serialize and return the updated request
            serializer = RequestSerializer(req)
            
            return Response({
                'message': 'Request accepted successfully',
                'request': serializer.data,
                'booking_id': booking.booking_id
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to accept request',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for requests service
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'service': 'MechConnect Requests API'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_direct_request_quotation(request, request_id):
    """
    Create a quotation for a request (both custom and direct requests).
    Only the assigned mechanic can create a quotation.
    Only requests in 'pending' status can be quoted.
    """
    try:
        # Get the authenticated user
        user = request.user
        
        # Check if user has a mechanic profile
        try:
            mechanic = Mechanic.objects.get(mechanic_id=user.acc_id)
        except Mechanic.DoesNotExist:
            return Response({
                'error': 'Access denied. User is not a mechanic.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the request
        try:
            req = Request.objects.select_related(
                'provider', 'client'
            ).prefetch_related(
                'direct_request', 'custom_request'
            ).get(request_id=request_id)
        except Request.DoesNotExist:
            return Response({
                'error': 'Request not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate request type (both custom and direct are supported)
        if req.request_type not in ['direct', 'custom']:
            return Response({
                'error': 'Only direct and custom requests can be quoted.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate request is assigned to this mechanic
        if req.provider is None or req.provider.acc_id != user.acc_id:
            return Response({
                'error': 'You can only quote requests assigned to you.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate request status
        if req.request_status != 'pending':
            return Response({
                'error': f'Cannot quote request. Current status is \"{req.request_status}\". Only pending requests can be quoted.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate input data
        serializer = CreateDirectRequestQuotationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use transaction to ensure atomicity
        with transaction.atomic():
            data = serializer.validated_data
            
            # Handle different request types
            if req.request_type == 'direct':
                # Get the direct request
                direct_request = DirectRequest.objects.get(request=req)
                
                # Delete existing quotation items if any (allow re-quoting)
                QuotedRequestItem.objects.filter(direct_request=direct_request).delete()
                
                # Create quotation items
                quoted_items = []
                for item_data in data['quoted_items']:
                    quoted_item = QuotedRequestItem.objects.create(
                        direct_request=direct_request,
                        item=item_data['item'],
                        price=float(item_data['price'])
                    )
                    quoted_items.append(quoted_item)
                
                # Update provider's note if provided
                if data.get('providers_note'):
                    direct_request.providers_note = data['providers_note']
                    direct_request.save()
                    
            else:  # custom request
                # Get the custom request
                custom_request = CustomRequest.objects.get(request=req)
                
                # Delete existing quotation items if any (allow re-quoting)
                QuotedRequestItem.objects.filter(custom_request=custom_request).delete()
                
                # Create quotation items
                quoted_items = []
                for item_data in data['quoted_items']:
                    quoted_item = QuotedRequestItem.objects.create(
                        custom_request=custom_request,
                        item=item_data['item'],
                        price=float(item_data['price'])
                    )
                    quoted_items.append(quoted_item)
                
                # Update provider's note if provided
                if data.get('providers_note'):
                    custom_request.providers_note = data['providers_note']
                    custom_request.save()
            
            # Update request status to 'qouted'
            req.request_status = 'qouted'
            req.save()
            
            # Serialize and return the updated request
            request_serializer = RequestSerializer(req)
            
            return Response({
                'message': 'Quotation created successfully',
                'request': request_serializer.data,
                'quotation_items': [
                    {'item': item.item, 'price': str(item.price)} 
                    for item in quoted_items
                ]
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': 'Failed to create quotation',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mechanic_quoted_requests(request):
    """
    Get quoted requests for the authenticated mechanic.
    Quoted = requests that have been quoted by this mechanic and awaiting client response.
    Uses JWT authentication - no mechanic_id parameter needed.
    Returns empty list if user has no mechanic profile.
    """
    # Get the authenticated user
    user = request.user
    
    # Check if user has a mechanic profile
    try:
        mechanic = Mechanic.objects.get(mechanic_id=user.acc_id)
    except Mechanic.DoesNotExist:
        # User has no mechanic profile, return empty list
        return Response({
            'jobs': [],
            'total': 0,
            'message': 'User has no mechanic profile'
        }, status=status.HTTP_200_OK)
    
    # Get quoted requests assigned to this mechanic
    requests_queryset = Request.objects.filter(
        provider=user.acc_id,
        request_status='qouted'
    ).select_related(
        'client',
        'client__client_id'
    ).prefetch_related(
        'custom_request',
        'direct_request',
        'emergency_request'
    ).order_by('-updated_at')
    
    # Serialize the requests
    serializer = RequestListSerializer(requests_queryset, many=True)
    return Response({
        'jobs': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)
