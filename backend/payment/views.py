from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import BookingPayment, Transaction
from .serializers import BookingPaymentSerializer, BookingPaymentDetailSerializer, TransactionSerializer
from bookings.models import Booking


@api_view(['POST'])
def create_payment(request):
    """
    Create a new payment for a booking
    POST /api/payments/create/
    Body: {
        "booking_id": 1,
        "payment_type": "advance" or "full",
        "payment_method": "gcash", "paymaya", "bank_transfer", "cash", "other",
        "amount_paid": 500.00,
        "payment_proof": "base64_string_or_url",
        "reference_number": "GCASH123456",
        "notes": "Optional notes"
    }
    """
    serializer = BookingPaymentSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        # Set payment date to now
        payment = serializer.save(payment_date=timezone.now())
        
        # Return detailed response
        detail_serializer = BookingPaymentDetailSerializer(payment)
        return Response({
            'message': 'Payment submitted successfully',
            'payment': detail_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_booking_payment(request, booking_id):
    """
    Get payment information for a specific booking
    GET /api/payments/booking/<booking_id>/
    """
    try:
        # Get the most recent payment for this booking
        payment = BookingPayment.objects.filter(booking__booking_id=booking_id).order_by('-created_at').first()
        
        if not payment:
            # Return default unpaid status if no payment exists
            try:
                booking = Booking.objects.get(booking_id=booking_id)
                return Response({
                    'payment_status': 'unpaid',
                    'total_amount': str(booking.amount_fee),
                    'amount_paid': '0.00',
                    'remaining_balance': str(booking.amount_fee),
                    'payment_method': None,
                    'payment_date': None,
                    'reference_number': None
                })
            except Booking.DoesNotExist:
                return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BookingPaymentDetailSerializer(payment)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def list_booking_payments(request, booking_id):
    """
    Get all payments for a specific booking (payment history)
    GET /api/payments/booking/<booking_id>/history/
    """
    payments = BookingPayment.objects.filter(booking__booking_id=booking_id).order_by('-created_at')
    serializer = BookingPaymentDetailSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
def update_payment(request, payment_id):
    """
    Update an existing payment (e.g., add additional payment for advance payment)
    PUT /api/payments/<payment_id>/
    """
    try:
        payment = BookingPayment.objects.get(payment_id=payment_id)
    except BookingPayment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Allow updating amount_paid, payment_proof, reference_number, notes
    allowed_fields = ['amount_paid', 'payment_proof', 'reference_number', 'notes', 'payment_method']
    update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
    
    serializer = BookingPaymentSerializer(payment, data=update_data, partial=True, context={'request': request})
    
    if serializer.is_valid():
        payment = serializer.save()
        detail_serializer = BookingPaymentDetailSerializer(payment)
        return Response({
            'message': 'Payment updated successfully',
            'payment': detail_serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_client_payments(request, client_id):
    """
    Get all payments made by a specific client
    GET /api/payments/client/<client_id>/
    """
    payments = BookingPayment.objects.filter(
        paid_by__acc_id=client_id
    ).select_related('booking').order_by('-created_at')
    
    serializer = BookingPaymentDetailSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_provider_payments(request, provider_id):
    """
    Get all payments for bookings assigned to a specific provider (mechanic/shop)
    GET /api/payments/provider/<provider_id>/
    """
    payments = BookingPayment.objects.filter(
        booking__request__provider__acc_id=provider_id
    ).select_related('booking').order_by('-created_at')
    
    serializer = BookingPaymentDetailSerializer(payments, many=True)
    return Response(serializer.data)
