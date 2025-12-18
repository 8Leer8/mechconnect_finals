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
    CustomRequestSerializer, DirectRequestSerializer, EmergencyRequestSerializer
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
                concern_picture=data.get('concern_picture', ''),
                estimated_budget=data.get('estimated_budget')
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
    When status is changed to 'accepted', automatically create a booking
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
        
        # Update request status
        old_status = req.request_status
        req.request_status = new_status
        req.save()
        
        # If status changed to 'rejected', send notification to client
        if new_status == 'rejected' and old_status != 'rejected':
            from accounts.models import Notification
            provider_name = 'Provider'
            if req.provider:
                if hasattr(req.provider, 'mechanic_profile'):
                    provider_name = f"{req.provider.firstname} {req.provider.lastname}"
                elif hasattr(req.provider, 'shop_profile'):
                    provider_name = req.provider.shop_profile.shop_name
            
            Notification.objects.create(
                receiver=req.client.client_id,
                title='Request Rejected',
                message=f'{provider_name} has rejected your service request.',
                type='alert'
            )
            print(f"Rejection notification sent to client: {req.client.client_id.acc_id}")
        
        # If status changed to 'accepted', create a booking
        booking_data = None
        if new_status == 'accepted' and old_status != 'accepted':
            from bookings.models import Booking
            from accounts.models import Notification
            
            # Check if booking already exists for this request
            existing_booking = Booking.objects.filter(request=req).first()
            
            if not existing_booking:
                # Determine the amount based on request type
                amount = 0
                if req.request_type == 'custom' and hasattr(req, 'custom_request'):
                    amount = req.custom_request.estimated_budget or 0
                elif req.request_type == 'direct' and hasattr(req, 'direct_request'):
                    # For direct requests, get the service price
                    amount = req.direct_request.service.price if req.direct_request.service else 0
                elif hasattr(req, 'price'):
                    amount = req.price
                
                print(f"Creating booking for request {req.request_id}, type: {req.request_type}, amount: {amount}")
                
                # Create new booking with 'active' status
                booking = Booking.objects.create(
                    request=req,
                    status='active',
                    amount_fee=amount
                )
                
                # Send notification to client
                provider_name = 'Provider'
                if req.provider:
                    if hasattr(req.provider, 'mechanic_profile'):
                        provider_name = f"{req.provider.firstname} {req.provider.lastname}"
                    elif hasattr(req.provider, 'shop_profile'):
                        provider_name = req.provider.shop_profile.shop_name
                
                # Debug logging
                print(f"Creating notification for client: {req.client.client_id}")
                print(f"Client ID acc_id: {req.client.client_id.acc_id}")
                
                notification = Notification.objects.create(
                    receiver=req.client.client_id,
                    title='Booking Request Accepted',
                    message=f'{provider_name} has accepted your service request. Your booking is now active.',
                    type='info'
                )
                
                print(f"Notification created: ID={notification.notification_id}, Receiver={notification.receiver.acc_id}")
                
                from bookings.serializers import BookingSerializer
                booking_serializer = BookingSerializer(booking)
                booking_data = booking_serializer.data
        
        serializer = RequestSerializer(req)
        
        response_data = {
            'message': 'Request status updated successfully',
            'request': serializer.data
        }
        
        if booking_data:
            response_data['booking'] = booking_data
            response_data['message'] = 'Request accepted and booking created successfully'
        
        return Response(response_data, status=status.HTTP_200_OK)
        
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
            
            # Determine the booking amount based on request type
            booking_amount = 0
            if req.request_type == 'custom' and hasattr(req, 'custom_request') and req.custom_request:
                # Use estimated_budget from custom request
                booking_amount = req.custom_request.estimated_budget or 0
            elif req.request_type == 'direct' and hasattr(req, 'direct_request') and req.direct_request:
                # Use service price for direct requests
                booking_amount = req.direct_request.service.price if req.direct_request.service else 0
            
            # Create a booking for this accepted request
            booking = Booking.objects.create(
                request=req,
                status='active',
                amount_fee=booking_amount
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_request(request, request_id):
    """
    Decline a request as a mechanic.
    - Validates user is authenticated
    - Validates user has mechanic role
    - Validates request is in pending/quoted state
    - Updates request status to rejected
    - Unassigns mechanic from request if assigned
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
        
        # Validate request state - only pending or quoted requests can be declined
        if req.request_status not in ['pending', 'qouted']:
            return Response({
                'error': f'Cannot decline request. Current status is "{req.request_status}". Only pending or quoted requests can be declined.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use transaction to ensure atomicity
        with transaction.atomic():
            # Update status to rejected
            req.request_status = 'rejected'
            
            # Unassign mechanic if this mechanic is assigned
            if req.provider and req.provider.acc_id == user.acc_id:
                req.provider = None
            
            req.save()
            
            # Serialize and return the updated request
            serializer = RequestSerializer(req)
            
            return Response({
                'message': 'Request declined successfully',
                'request': serializer.data
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to decline request',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_direct_request(request):
    """
    Create a new direct service request
    """
    try:
        print(f"Received direct request data: {request.data}")
        
        data = request.data
        
        # Validate required fields
        required_fields = ['client_id', 'provider_id', 'service_id', 'scheduled_date', 'scheduled_time']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Get the client
            try:
                client = Client.objects.get(client_id=data['client_id'])
            except Client.DoesNotExist:
                return Response({
                    'error': 'Client not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get provider
            try:
                provider = Account.objects.get(acc_id=data['provider_id'])
            except Account.DoesNotExist:
                return Response({
                    'error': 'Provider not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get service
            from services.models import Service, ServiceAddOn
            try:
                service = Service.objects.get(service_id=data['service_id'])
            except Service.DoesNotExist:
                return Response({
                    'error': 'Service not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Create the main request
            main_request = Request.objects.create(
                client=client,
                provider=provider,
                request_type='direct',
                request_status='pending'
            )
            
            # Create the direct request details
            direct_request = DirectRequest.objects.create(
                request=main_request,
                service=service
            )
            
            # Create add-on associations if provided
            if data.get('selected_addon_ids'):
                for addon_id in data['selected_addon_ids']:
                    try:
                        addon = ServiceAddOn.objects.get(service_add_on_id=addon_id)
                        from .models import DirectRequestAddOn
                        DirectRequestAddOn.objects.create(
                            request=main_request,
                            service_add_on=addon
                        )
                    except ServiceAddOn.DoesNotExist:
                        print(f"Warning: Addon {addon_id} not found")
                        continue
            
            # Update or create client address if location data provided
            address_fields = [
                'house_building_number', 'street_name', 'subdivision_village',
                'barangay', 'city_municipality', 'province', 'region', 'postal_code'
            ]
            
            address_data = {field: data.get(field, '') for field in address_fields}
            if any(address_data.values()):
                address, created = AccountAddress.objects.get_or_create(
                    acc_add_id=client.client_id,
                    defaults=address_data
                )
                if not created:
                    for field, value in address_data.items():
                        if value:
                            setattr(address, field, value)
                    address.save()
            
            # Store schedule info in service_details (optional for now)
            # You could extend DirectRequest model to include schedule fields
            
            # Return the created request
            request_serializer = RequestSerializer(main_request)
            
            return Response({
                'message': 'Direct request created successfully',
                'request': request_serializer.data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"Error creating direct request: {str(e)}")
        return Response({
            'error': 'Failed to create direct request',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_emergency_request(request):
    """
    Create a new emergency request
    """
    try:
        print(f"Received emergency request data: {request.data}")
        
        data = request.data
        
        # Validate required fields
        if 'client_id' not in data:
            return Response({
                'error': 'client_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if 'description' not in data or not data['description'].strip():
            return Response({
                'error': 'description is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Get the client
            try:
                client = Client.objects.get(client_id=data['client_id'])
            except Client.DoesNotExist:
                return Response({
                    'error': 'Client not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get provider if specified (optional for emergency)
            provider = None
            if data.get('provider_id'):
                try:
                    provider = Account.objects.get(acc_id=data['provider_id'])
                except Account.DoesNotExist:
                    pass  # Provider is optional for emergency
            
            # Create the main request
            main_request = Request.objects.create(
                client=client,
                provider=provider,
                request_type='emergency',
                request_status='pending'
            )
            
            # Create the emergency request details
            emergency_request = EmergencyRequest.objects.create(
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
            if any(address_data.values()):
                address, created = AccountAddress.objects.get_or_create(
                    acc_add_id=client.client_id,
                    defaults=address_data
                )
                if not created:
                    for field, value in address_data.items():
                        if value:
                            setattr(address, field, value)
                    address.save()
            
            # Return the created request
            request_serializer = RequestSerializer(main_request)
            
            return Response({
                'message': 'Emergency request created successfully',
                'request': request_serializer.data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"Error creating emergency request: {str(e)}")
        return Response({
            'error': 'Failed to create emergency request',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_request(request):
    """
    Cancel/withdraw a pending request - creates a cancelled booking
    POST /api/requests/cancel/
    """
    request_id = request.data.get('request_id')
    reason = request.data.get('reason', '')
    
    if not request_id:
        return Response({'error': 'request_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service_request = Request.objects.get(request_id=request_id)
    except Request.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Only allow cancellation of pending or quoted requests
    if service_request.request_status not in ['pending', 'qouted']:
        return Response(
            {'error': f'Cannot cancel request with status: {service_request.request_status}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create a booking with cancelled status
    from bookings.models import Booking, CancelledBooking
    from accounts.models import Account
    
    # Create the booking
    booking = Booking.objects.create(
        request=service_request,
        status='cancelled',
        amount_fee=0
    )
    
    # Get client account
    client_account = service_request.client.client_id
    
    # Create cancelled booking record
    CancelledBooking.objects.create(
        booking=booking,
        reason=reason,
        cancelled_by=client_account,
        cancelled_by_role='client',
        status='cancelled'
    )
    
    # Update request status to accepted (so it shows as converted to booking)
    service_request.request_status = 'accepted'
    service_request.save()
    
    return Response({
        'message': 'Request cancelled successfully',
        'booking_id': booking.booking_id,
        'status': booking.status
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def accept_quotation(request, request_id):
    """
    Accept a quoted request - changes status to 'accepted' and creates booking with quoted items total
    POST /api/requests/<request_id>/accept-quotation/
    """
    try:
        # Get the request
        service_request = Request.objects.get(request_id=request_id)
        
        # Verify request is in quoted status
        if service_request.request_status != 'qouted':
            return Response({
                'error': f'Request must be in quoted status. Current status: {service_request.request_status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get custom request and quoted items
        if not hasattr(service_request, 'custom_request'):
            return Response({
                'error': 'Only custom requests can be quoted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        custom_request = service_request.custom_request
        quoted_items = custom_request.quoted_items.all()
        
        if not quoted_items.exists():
            return Response({
                'error': 'No quoted items found for this request'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate total from quoted items
        total_amount = sum(item.price for item in quoted_items)
        
        # Update request status to accepted
        service_request.request_status = 'accepted'
        service_request.save()
        
        # Create booking
        from bookings.models import Booking
        from accounts.models import Notification
        
        booking = Booking.objects.create(
            request=service_request,
            status='active',
            amount_fee=total_amount
        )
        
        # Send notification to provider
        if service_request.provider:
            provider_name = 'Provider'
            if hasattr(service_request.provider, 'mechanic_profile'):
                provider_name = f"{service_request.provider.firstname} {service_request.provider.lastname}"
            elif hasattr(service_request.provider, 'shop_profile'):
                provider_name = service_request.provider.shop_profile.shop_name
            
            Notification.objects.create(
                receiver=service_request.provider,
                title='Quotation Accepted',
                message=f'Client has accepted your quotation for ₱{total_amount}. Booking #{booking.booking_id} is now active.',
                type='info'
            )
            print(f"Quotation acceptance notification sent to provider: {service_request.provider.acc_id}")
        
        # Send notification to client
        Notification.objects.create(
            receiver=service_request.client.client_id,
            title='Quotation Accepted',
            message=f'You have accepted the quotation for ₱{total_amount}. Your booking is now active.',
            type='info'
        )
        print(f"Quotation acceptance notification sent to client: {service_request.client.client_id.acc_id}")
        
        from bookings.serializers import BookingSerializer
        booking_serializer = BookingSerializer(booking)
        
        return Response({
            'message': 'Quotation accepted successfully',
            'booking': booking_serializer.data,
            'total_amount': str(total_amount)
        }, status=status.HTTP_200_OK)
        
    except Request.DoesNotExist:
        return Response({
            'error': 'Request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to accept quotation',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reject_quotation(request, request_id):
    """
    Reject a quoted request - changes status to 'rejected'
    POST /api/requests/<request_id>/reject-quotation/
    Body: { "reason": "optional rejection reason" }
    """
    try:
        # Get the request
        service_request = Request.objects.get(request_id=request_id)
        
        # Verify request is in quoted status
        if service_request.request_status != 'qouted':
            return Response({
                'error': f'Request must be in quoted status. Current status: {service_request.request_status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get rejection reason if provided
        reason = request.data.get('reason', '')
        
        # Update request status to rejected
        service_request.request_status = 'rejected'
        service_request.save()
        
        # Send notification to provider
        from accounts.models import Notification
        
        if service_request.provider:
            provider_name = 'Provider'
            if hasattr(service_request.provider, 'mechanic_profile'):
                provider_name = f"{service_request.provider.firstname} {service_request.provider.lastname}"
            elif hasattr(service_request.provider, 'shop_profile'):
                provider_name = service_request.provider.shop_profile.shop_name
            
            message = f'Client has rejected your quotation for request #{service_request.request_id}.'
            if reason:
                message += f' Reason: {reason}'
            
            Notification.objects.create(
                receiver=service_request.provider,
                title='Quotation Rejected',
                message=message,
                type='warning'
            )
            print(f"Quotation rejection notification sent to provider: {service_request.provider.acc_id}")
        
        return Response({
            'message': 'Quotation rejected successfully',
            'request_id': service_request.request_id,
            'status': service_request.request_status
        }, status=status.HTTP_200_OK)
        
    except Request.DoesNotExist:
        return Response({
            'error': 'Request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to reject quotation',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_quoted_items(request, request_id):
    """
    Create quoted items for a custom request (for provider/mechanic side)
    POST /api/requests/<request_id>/create-quote/
    Body: {
        "items": [
            {"item": "Oil Change", "price": 500.00},
            {"item": "Brake Pad Replacement", "price": 1500.00}
        ],
        "providers_note": "Optional note from provider"
    }
    """
    try:
        # Get the request
        service_request = Request.objects.get(request_id=request_id)
        
        # Verify it's a custom request
        if service_request.request_type != 'custom':
            return Response({
                'error': 'Only custom requests can be quoted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify request is in pending status
        if service_request.request_status not in ['pending']:
            return Response({
                'error': f'Can only create quotes for pending requests. Current status: {service_request.request_status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get items from request body
        items_data = request.data.get('items', [])
        providers_note = request.data.get('providers_note', '')
        
        if not items_data:
            return Response({
                'error': 'At least one item is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get custom request
        custom_request = service_request.custom_request
        
        # Update provider's note if provided
        if providers_note:
            custom_request.providers_note = providers_note
            custom_request.save()
        
        # Delete existing quoted items (if any)
        custom_request.quoted_items.all().delete()
        
        # Create new quoted items
        created_items = []
        for item_data in items_data:
            quoted_item = QuotedRequestItem.objects.create(
                custom_request=custom_request,
                item=item_data.get('item', ''),
                price=item_data.get('price', 0)
            )
            created_items.append(quoted_item)
        
        # Update request status to quoted
        service_request.request_status = 'qouted'
        service_request.save()
        
        # Send notification to client
        from accounts.models import Notification
        
        provider_name = 'Provider'
        if service_request.provider:
            if hasattr(service_request.provider, 'mechanic_profile'):
                provider_name = f"{service_request.provider.firstname} {service_request.provider.lastname}"
            elif hasattr(service_request.provider, 'shop_profile'):
                provider_name = service_request.provider.shop_profile.shop_name
        
        total = sum(item.price for item in created_items)
        
        Notification.objects.create(
            receiver=service_request.client.client_id,
            title='Quotation Received',
            message=f'{provider_name} has sent you a quotation for ₱{total}. Review it in your requests.',
            type='info'
        )
        print(f"Quotation notification sent to client: {service_request.client.client_id.acc_id}")
        
        from .serializers import QuotedRequestItemSerializer
        serializer = QuotedRequestItemSerializer(created_items, many=True)
        
        return Response({
            'message': 'Quote created successfully',
            'request_id': service_request.request_id,
            'items': serializer.data,
            'total': str(total)
        }, status=status.HTTP_201_CREATED)
        
    except Request.DoesNotExist:
        return Response({
            'error': 'Request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to create quote',
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
