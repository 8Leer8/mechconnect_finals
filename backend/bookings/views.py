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
        ).get(booking_id=booking_id)
        
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


@api_view(['GET'])
def health_check(request):
    """Health check endpoint for bookings API"""
    return Response({'status': 'healthy', 'message': 'Bookings API is running'}, status=status.HTTP_200_OK)
