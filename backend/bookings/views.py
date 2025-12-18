from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from .models import (
    Booking, ActiveBooking, RescheduledBooking, CancelledBooking,
    BackJobsBooking, Dispute, RefundedBooking, CompletedBooking
)
from .serializers import (
    BookingSerializer, BookingListSerializer, ActiveBookingSerializer,
    CompletedBookingSerializer, RescheduledBookingSerializer,
    CancelledBookingSerializer, BackJobsBookingSerializer,
    DisputeSerializer, RefundedBookingSerializer
)
from accounts.models import Client


@api_view(['GET'])
def client_bookings_list(request):
    """Get bookings for a specific client filtered by status"""
    client_id = request.GET.get('client_id')
    booking_status = request.GET.get('status', 'active')
    
    if not client_id:
        return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = Client.objects.get(client_id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Map frontend status to backend status
    status_mapping = {
        'active': 'active',
        'completed': 'completed',
        'rescheduled': 'rescheduled',
        'back-jobs': 'back_jobs',
        'rejected': 'rejected',  # This might need custom logic
        'canceled': 'cancelled',
        'disputed': 'dispute',
        'refunded': 'refunded'
    }
    
    backend_status = status_mapping.get(booking_status, 'active')
    
    # Get bookings for this client with the specified status
    bookings = Booking.objects.filter(
        request__client=client,
        status=backend_status
    ).select_related(
        'request',
        'request__client',
        'request__client__client_id',
        'request__provider'
    ).prefetch_related(
        'request__custom_request',
        'request__direct_request',
        'request__emergency_request'
    ).order_by('-booked_at')
    
    serializer = BookingListSerializer(bookings, many=True)
    
    return Response({
        'bookings': serializer.data,
        'count': bookings.count(),
        'status': booking_status
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def booking_detail(request, booking_id):
    """Get or update detailed information about a specific booking"""
    try:
        booking = Booking.objects.select_related(
            'request',
            'request__client',
            'request__client__client_id',
            'request__provider'
        ).prefetch_related(
            'request__custom_request',
            'request__direct_request',
            'request__emergency_request'
        ).get(booking_id=booking_id)
        
        if request.method == 'GET':
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Handle status updates for back_jobs
            new_status = request.data.get('status')
            
            if new_status:
                # Validate status transition
                valid_transitions = {
                    'back_jobs': ['active', 'completed'],
                    'active': ['completed', 'back_jobs'],
                }
                
                current_status = booking.status
                if current_status in valid_transitions:
                    if new_status not in valid_transitions[current_status]:
                        return Response(
                            {'error': f'Cannot transition from {current_status} to {new_status}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                booking.status = new_status
                if new_status == 'completed':
                    booking.completed_at = timezone.now()
                booking.save()
                
                serializer = BookingSerializer(booking)
                return Response(serializer.data)
            
            return Response(
                {'error': 'Status field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def active_booking_detail(request, booking_id):
    """Get detailed information about an active booking"""
    try:
        active_booking = ActiveBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking_id=booking_id)
        
        serializer = ActiveBookingSerializer(active_booking)
        return Response(serializer.data)
        
    except ActiveBooking.DoesNotExist:
        return Response({'error': 'Active booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def completed_booking_detail(request, booking_id):
    """Get detailed information about a completed booking"""
    try:
        completed_booking = CompletedBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking_id=booking_id)
        
        serializer = CompletedBookingSerializer(completed_booking)
        return Response(serializer.data)
        
    except CompletedBooking.DoesNotExist:
        return Response({'error': 'Completed booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def rescheduled_booking_detail(request, booking_id):
    """Get detailed information about a rescheduled booking"""
    try:
        rescheduled_booking = RescheduledBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking__booking_id=booking_id)
        
        serializer = RescheduledBookingSerializer(rescheduled_booking)
        return Response(serializer.data)
        
    except RescheduledBooking.DoesNotExist:
        return Response({'error': 'Rescheduled booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def cancelled_booking_detail(request, booking_id):
    """Get detailed information about a cancelled booking"""
    try:
        cancelled_booking = CancelledBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking__booking_id=booking_id)
        
        serializer = CancelledBookingSerializer(cancelled_booking)
        return Response(serializer.data)
        
    except CancelledBooking.DoesNotExist:
        return Response({'error': 'Cancelled booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def back_jobs_booking_detail(request, booking_id):
    """Get detailed information about a back jobs booking"""
    try:
        back_jobs_booking = BackJobsBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking__booking_id=booking_id)
        
        serializer = BackJobsBookingSerializer(back_jobs_booking)
        return Response(serializer.data)
        
    except BackJobsBooking.DoesNotExist:
        return Response({'error': 'Back jobs booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def disputed_booking_detail(request, booking_id):
    """Get detailed information about a disputed booking"""
    try:
        disputed_booking = Dispute.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking__booking_id=booking_id)
        
        serializer = DisputeSerializer(disputed_booking)
        return Response(serializer.data)
        
    except Dispute.DoesNotExist:
        return Response({'error': 'Disputed booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def refunded_booking_detail(request, booking_id):
    """Get detailed information about a refunded booking"""
    try:
        refunded_booking = RefundedBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking__booking_id=booking_id)
        
        serializer = RefundedBookingSerializer(refunded_booking)
        return Response(serializer.data)
        
    except RefundedBooking.DoesNotExist:
        return Response({'error': 'Refunded booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def rescheduled_bookings_list(request):
    """Get list of rescheduled bookings for a client"""
    client_id = request.GET.get('client_id')
    
    if not client_id:
        return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = Client.objects.get(client_id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    rescheduled_bookings = RescheduledBooking.objects.filter(
        booking__request__client=client
    ).select_related(
        'booking',
        'booking__request',
        'requested_by'
    ).order_by('-requested_at')
    
    serializer = RescheduledBookingSerializer(rescheduled_bookings, many=True)
    return Response({'rescheduled_bookings': serializer.data})


@api_view(['GET'])
def cancelled_bookings_list(request):
    """Get list of cancelled bookings for a client"""
    client_id = request.GET.get('client_id')
    
    if not client_id:
        return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = Client.objects.get(client_id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    cancelled_bookings = CancelledBooking.objects.filter(
        booking__request__client=client
    ).select_related(
        'booking',
        'booking__request',
        'cancelled_by'
    ).order_by('-cancelled_at')
    
    serializer = CancelledBookingSerializer(cancelled_bookings, many=True)
    return Response({'cancelled_bookings': serializer.data})


@api_view(['GET'])
def back_jobs_bookings_list(request):
    """Get list of back jobs bookings for a client"""
    client_id = request.GET.get('client_id')
    
    if not client_id:
        return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = Client.objects.get(client_id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    back_jobs_bookings = BackJobsBooking.objects.filter(
        booking__request__client=client
    ).select_related(
        'booking',
        'booking__request',
        'requested_by'
    ).order_by('-created_at')
    
    serializer = BackJobsBookingSerializer(back_jobs_bookings, many=True)
    return Response({'back_jobs_bookings': serializer.data})


@api_view(['GET'])
def disputed_bookings_list(request):
    """Get list of disputed bookings for a client"""
    client_id = request.GET.get('client_id')
    
    if not client_id:
        return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = Client.objects.get(client_id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    disputed_bookings = Dispute.objects.filter(
        booking__request__client=client
    ).select_related(
        'booking',
        'booking__request',
        'complainer',
        'complaint_against'
    ).order_by('-created_at')
    
    serializer = DisputeSerializer(disputed_bookings, many=True)
    return Response({'disputed_bookings': serializer.data})


@api_view(['GET'])
def refunded_bookings_list(request):
    """Get list of refunded bookings for a client"""
    client_id = request.GET.get('client_id')
    
    if not client_id:
        return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = Client.objects.get(client_id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    
    refunded_bookings = RefundedBooking.objects.filter(
        booking__request__client=client
    ).select_related(
        'booking',
        'booking__request',
        'requested_by'
    ).order_by('-requested_at')
    
    serializer = RefundedBookingSerializer(refunded_bookings, many=True)
    return Response({'refunded_bookings': serializer.data})


from accounts.models import Client, Mechanic
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mechanic_bookings_list(request):
    """
    Get bookings/jobs for the authenticated mechanic, filtered by status.
    Uses JWT authentication - no mechanic_id parameter needed.
    Returns empty list if user has no mechanic profile or no jobs.
    """
    booking_status = request.GET.get('status', '')
    
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
    
    # Build query based on status
    query_filter = {
        'request__provider': user.acc_id
    }
    
    # Map frontend status to backend status
    status_mapping = {
        'active': 'active',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'rescheduled': 'rescheduled',
        'backjob': 'back_jobs',
        'back-jobs': 'back_jobs',
        'disputed': 'dispute',
        'refunded': 'refunded'
    }
    
    # Handle different status filters
    if booking_status and booking_status != 'all':
        backend_status = status_mapping.get(booking_status, booking_status)
        query_filter['status'] = backend_status
    
    # Get bookings for this mechanic
    bookings = Booking.objects.filter(
        **query_filter
    ).select_related(
        'request',
        'request__client',
        'request__client__client_id'
    ).prefetch_related(
        'request__custom_request',
        'request__direct_request',
        'request__emergency_request'
    ).order_by('-booked_at')
    
    # Serialize the bookings
    serializer = BookingListSerializer(bookings, many=True)
    
    return Response({
        'jobs': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_booking(request, booking_id):
    """Complete an active booking (mechanic only)"""
    try:
        # Get the booking
        booking = Booking.objects.select_related(
            'request',
            'request__provider'
        ).get(booking_id=booking_id)
        
        # Verify the requesting user is a mechanic
        try:
            from accounts.models import Mechanic
            mechanic = Mechanic.objects.get(mechanic_id=request.user)
        except Mechanic.DoesNotExist:
            return Response(
                {'error': 'Only mechanics can complete bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify the mechanic is assigned to this booking
        # booking.request.provider is an Account instance
        # request.user is also an Account instance
        if booking.request.provider != request.user:
            # Add logging for debugging
            print(f"Permission denied: booking.request.provider={booking.request.provider.id}, request.user={request.user.id}")
            return Response(
                {'error': 'You are not assigned to this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify booking is in a valid state to be completed
        if booking.status not in ['active']:
            return Response(
                {'error': f'Cannot complete booking with status: {booking.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update booking status to completed
        booking.status = 'completed'
        booking.completed_at = timezone.now()
        booking.save()
        
        # Create CompletedBooking record if needed
        try:
            CompletedBooking.objects.get_or_create(
                booking=booking,
                defaults={
                    'status': 'completed',
                    'completed_at': booking.completed_at
                }
            )
        except Exception as e:
            # Log but don't fail if CompletedBooking creation fails
            print(f"Warning: Could not create CompletedBooking: {e}")
        
        # Serialize and return the updated booking
        serializer = BookingSerializer(booking)
        return Response({
            'message': 'Booking completed successfully',
            'booking': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to complete booking: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """Health check endpoint for bookings API"""
    return Response({'status': 'healthy', 'message': 'Bookings API is running'}, status=status.HTTP_200_OK)
