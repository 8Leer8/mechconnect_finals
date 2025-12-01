from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404

from bookings.models import Booking, RefundedBooking
from payment.models import CommissionSettings


def get_commission_rate():
    """
    Get the current commission rate from database
    Returns default 15% if not set
    """
    try:
        commission_setting = CommissionSettings.objects.first()
        if commission_setting:
            return float(commission_setting.rate)
        return 15.0  # Default fallback
    except Exception:
        return 15.0  # Default fallback


@api_view(['GET'])
@permission_classes([AllowAny])
def get_financial_stats(request):
    """
    Get financial statistics for head admin
    """
    try:
        # Calculate total revenue from completed bookings
        completed_bookings = Booking.objects.filter(status='completed')
        total_revenue = completed_bookings.aggregate(total=Sum('amount_fee'))['total'] or 0
        
        # Get commission rate from database
        commission_rate = get_commission_rate()
        total_commission = float(total_revenue) * (commission_rate / 100)
        platform_earnings = total_commission
        
        # Pending payouts (completed but not paid out to mechanics)
        pending_payouts = completed_bookings.filter(
            Q(payout_status='pending') | Q(payout_status__isnull=True)
        ).count()
        pending_payout_amount = completed_bookings.filter(
            Q(payout_status='pending') | Q(payout_status__isnull=True)
        ).aggregate(total=Sum('amount_fee'))['total'] or 0
        
        # Refunded amount
        refunded_amount = RefundedBooking.objects.filter(
            status='approved'
        ).aggregate(total=Sum('refund_amount'))['total'] or 0
        
        return Response({
            'total_revenue': str(total_revenue),
            'total_commission': str(total_commission),
            'commission_rate': commission_rate,
            'pending_payouts': pending_payouts,
            'pending_payout_amount': str(pending_payout_amount),
            'completed_bookings': completed_bookings.count(),
            'refunded_amount': str(refunded_amount),
            'platform_earnings': str(platform_earnings)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch financial statistics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_financial_transactions(request):
    """
    Get all financial transactions for head admin
    """
    try:
        from requests.models import Request
        
        bookings = Booking.objects.select_related(
            'request__client__client_profile',
            'request__provider'
        ).filter(status__in=['completed', 'refunded']).order_by('-completed_at')
        
        # Get commission rate from database
        commission_rate = get_commission_rate()
        
        transactions = []
        for booking in bookings:
            # Calculate commission using database rate
            amount = float(booking.amount_fee) if booking.amount_fee else 0
            commission_amount = amount * (commission_rate / 100)
            
            # Get provider (mechanic or shop owner)
            provider = booking.request.provider
            provider_name = f"{provider.firstname} {provider.lastname}" if provider else "N/A"
            provider_email = provider.email if provider else "N/A"
            
            # Get client info
            client = booking.request.client
            client_account = client.client_id
            client_name = f"{client_account.firstname} {client_account.lastname}"
            
            # Get service name based on request type
            service_name = "N/A"
            if hasattr(booking.request, 'direct_request') and booking.request.direct_request:
                service_name = booking.request.direct_request.service.service_name
            elif hasattr(booking.request, 'custom_request'):
                service_name = "Custom Request"
            elif hasattr(booking.request, 'emergency_request'):
                service_name = "Emergency Request"
            
            transactions.append({
                'id': booking.booking_id,
                'booking_id': booking.booking_id,
                'mechanic_name': provider_name,
                'mechanic_email': provider_email,
                'client_name': client_name,
                'service_name': service_name,
                'amount': str(amount),
                'commission_amount': str(commission_amount),
                'commission_rate': commission_rate,
                'status': booking.status,
                'payment_method': 'Online Payment',  # Update this based on your payment model
                'transaction_date': booking.completed_at.isoformat() if booking.completed_at else booking.booked_at.isoformat()
            })
        
        return Response(transactions, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch transactions',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def commission_settings(request):
    """
    Get or update commission settings
    """
    try:
        if request.method == 'GET':
            # Get current commission settings
            commission_setting = CommissionSettings.objects.first()
            
            if commission_setting:
                return Response({
                    'rate': float(commission_setting.rate),
                    'updated_at': commission_setting.updated_at.isoformat() if hasattr(commission_setting, 'updated_at') else None
                }, status=status.HTTP_200_OK)
            else:
                # Return default if not set
                return Response({
                    'rate': 15.0,
                    'updated_at': None,
                    'message': 'Using default commission rate'
                }, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            # Update commission rate
            new_rate = request.data.get('rate')
            
            if new_rate is None:
                return Response({
                    'error': 'Commission rate is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                new_rate = float(new_rate)
                if new_rate < 0 or new_rate > 100:
                    return Response({
                        'error': 'Commission rate must be between 0 and 100'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({
                    'error': 'Invalid commission rate format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update or create commission settings
            commission_setting = CommissionSettings.objects.first()
            if commission_setting:
                commission_setting.rate = new_rate
                commission_setting.save()
            else:
                CommissionSettings.objects.create(rate=new_rate)
            
            return Response({
                'message': 'Commission rate updated successfully',
                'rate': new_rate
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to manage commission settings',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
