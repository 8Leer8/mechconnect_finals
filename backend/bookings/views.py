from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Q
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
        # client_id is actually the Account's acc_id (OneToOneField relationship)
        client = Client.objects.get(client_id__acc_id=client_id)
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
        'cancelled': 'cancelled',  # Support both spellings
        'disputed': 'dispute',
        'dispute': 'dispute',  # Support both forms
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


@api_view(['GET'])
def booking_detail(request, booking_id):
    """Get detailed information about a specific booking"""
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
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data)
        
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def active_booking_detail(request, booking_id):
    """Get detailed information about an active booking"""
    try:
        # First try to get the ActiveBooking record
        active_booking = ActiveBooking.objects.select_related(
            'booking',
            'booking__request',
            'booking__request__client',
            'booking__request__client__client_id',
            'booking__request__provider'
        ).get(booking__booking_id=booking_id)
        
        serializer = ActiveBookingSerializer(active_booking)
        return Response(serializer.data)
        
    except ActiveBooking.DoesNotExist:
        # If no ActiveBooking exists, check if there's a regular booking with status='active'
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
            ).get(booking_id=booking_id, status='active')
            
            # Return the booking data using the general BookingSerializer
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
            
        except Booking.DoesNotExist:
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
        ).get(booking__booking_id=booking_id)
        
        serializer = CompletedBookingSerializer(completed_booking)
        return Response(serializer.data)
        
    except CompletedBooking.DoesNotExist:
        # Fall back to general Booking if no CompletedBooking record exists
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
            ).get(booking_id=booking_id, status='completed')
            
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
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
        # Fall back to general Booking if no RescheduledBooking record exists
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
            ).get(booking_id=booking_id, status='rescheduled')
            
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
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
        # Fall back to general Booking if no CancelledBooking record exists
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
            ).get(booking_id=booking_id, status='cancelled')
            
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
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


@api_view(['GET', 'POST'])
def back_jobs_bookings_list(request):
    """Get list of back jobs bookings for a client or create a new back job request"""
    
    if request.method == 'POST':
        # Create a new back job request
        booking_id = request.data.get('booking_id')
        client_id = request.data.get('client_id')
        reason = request.data.get('reason', '')
        
        print(f"[BackJob POST] Received: booking_id={booking_id}, client_id={client_id}")
        
        if not booking_id:
            return Response({'error': 'Booking ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not client_id:
            return Response({'error': 'Client ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            booking = Booking.objects.get(booking_id=booking_id)
            client = Client.objects.get(client_id=client_id)
            
            print(f"[BackJob POST] Booking found: #{booking.booking_id}, belongs to client: {booking.request.client.client_id}")
            print(f"[BackJob POST] Requesting client: {client_id}")
            
            # Verify the booking belongs to this client
            if booking.request.client.client_id.acc_id != client_id:
                return Response(
                    {'error': 'This booking does not belong to you'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify the booking is completed
            if booking.status != 'completed':
                return Response(
                    {'error': 'Can only request back job for completed bookings'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the back job request
            back_job = BackJobsBooking.objects.create(
                booking=booking,
                requested_by=client.client_id,
                reason=reason,
                status='pending'
            )
            
            print(f"[BackJob POST] Created BackJobsBooking #{back_job.back_jobs_booking_id}")
            
            # Update the main booking status to back_jobs
            booking.status = 'back_jobs'
            booking.save()
            
            print(f"[BackJob POST] Updated booking #{booking.booking_id} status to 'back_jobs'")
            
            serializer = BackJobsBookingSerializer(back_job)
            return Response({
                'message': 'Back job request created successfully',
                'back_job': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        except Client.DoesNotExist:
            return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # GET request - list back jobs
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


@api_view(['GET'])
def mechanic_bookings_list(request):
    """Get bookings for a specific mechanic filtered by status"""
    mechanic_id = request.GET.get('mechanic_id')
    booking_status = request.GET.get('status', 'active')

    if not mechanic_id:
        return Response({'error': 'Mechanic ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        mechanic = Mechanic.objects.get(mechanic_id=mechanic_id)
    except Mechanic.DoesNotExist:
        return Response({'error': 'Mechanic not found'}, status=status.HTTP_404_NOT_FOUND)

    # Map frontend status to backend status
    status_mapping = {
        'active': 'active',
        'completed': 'completed',
        'cancelled': 'cancelled',
        'rescheduled': 'rescheduled',
        'back-jobs': 'back_jobs',
        'disputed': 'dispute',
        'refunded': 'refunded'
    }

    backend_status = status_mapping.get(booking_status, 'active')

    # Get bookings for this mechanic with the specified status
    bookings = Booking.objects.filter(
        request__provider=mechanic.mechanic_id.acc_id,
        status=backend_status
    ).select_related('request__client', 'request').order_by('-booked_at')

    # Serialize the bookings
    serializer = BookingListSerializer(bookings, many=True)
    return Response({
        'bookings': serializer.data,
        'total': len(serializer.data)
    })


@api_view(['POST'])
def request_reschedule(request):
    """
    Create a reschedule request for a booking
    POST /api/bookings/<booking_id>/reschedule/
    """
    booking_id = request.data.get('booking_id')
    reason = request.data.get('reason', '')
    requested_by_id = request.data.get('requested_by_id')
    
    if not booking_id:
        return Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        booking = Booking.objects.get(booking_id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get requested_by account
    from accounts.models import Account
    requested_by = None
    if requested_by_id:
        try:
            requested_by = Account.objects.get(acc_id=requested_by_id)
        except Account.DoesNotExist:
            pass
    
    # Determine role
    requested_by_role = 'client'  # Default to client
    
    # Create reschedule request
    reschedule = RescheduledBooking.objects.create(
        booking=booking,
        reason=reason,
        requested_by=requested_by,
        requested_by_role=requested_by_role,
        status='pending'
    )
    
    # Update booking status to rescheduled
    booking.status = 'rescheduled'
    booking.save()
    
    return Response({
        'message': 'Reschedule request submitted successfully',
        'reschedule_id': reschedule.rescheduled_booking_id,
        'booking_id': booking.booking_id,
        'status': booking.status
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def cancel_booking(request):
    """
    Cancel a booking
    POST /api/bookings/cancel/
    """
    booking_id = request.data.get('booking_id')
    reason = request.data.get('reason', '')
    cancelled_by_id = request.data.get('cancelled_by_id')
    
    if not booking_id:
        return Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        booking = Booking.objects.get(booking_id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get cancelled_by account
    from accounts.models import Account
    cancelled_by = None
    if cancelled_by_id:
        try:
            cancelled_by = Account.objects.get(acc_id=cancelled_by_id)
        except Account.DoesNotExist:
            pass
    
    # Determine role
    cancelled_by_role = 'client'  # Default to client
    
    # Create cancellation record
    cancellation = CancelledBooking.objects.create(
        booking=booking,
        reason=reason,
        cancelled_by=cancelled_by,
        cancelled_by_role=cancelled_by_role,
        status='cancelled'
    )
    
    # Update booking status to cancelled
    booking.status = 'cancelled'
    booking.save()
    
    return Response({
        'message': 'Booking cancelled successfully',
        'cancellation_id': cancellation.cancelled_booking_id,
        'booking_id': booking.booking_id,
        'status': booking.status
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def mark_booking_complete(request):
    """
    Mark a booking as completed (for client to request completion)
    POST /api/bookings/<booking_id>/complete/
    """
    booking_id = request.data.get('booking_id')
    
    if not booking_id:
        return Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        booking = Booking.objects.get(booking_id=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update booking status to completed
    from django.utils import timezone
    booking.status = 'completed'
    booking.completed_at = timezone.now()
    booking.save()
    
    # Create CompletedBooking entry if it doesn't exist
    completed_booking, created = CompletedBooking.objects.get_or_create(
        booking=booking,
        defaults={
            'completed_at': timezone.now()
        }
    )
    
    return Response({
        'message': 'Booking marked as completed successfully',
        'booking_id': booking.booking_id,
        'status': booking.status,
        'completed_at': booking.completed_at
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def health_check(request):
    """Health check endpoint for bookings API"""
    return Response({'status': 'healthy', 'message': 'Bookings API is running'}, status=status.HTTP_200_OK)
