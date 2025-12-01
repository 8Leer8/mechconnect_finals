from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum, Q

from ..models import Account, AccountBan, ReportAccount
from ..permissions import head_admin_required
from bookings.models import Booking, Dispute, RefundedBooking
from services.models import Service, ServiceCategory
from shop.models import Shop


@api_view(['GET'])
@permission_classes([AllowAny])
def head_admin_dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for head admin
    """
    # DEBUG PRINTS
    print('DEBUG Dashboard:')
    print('  total_users:', Account.objects.count())
    print('  clients:', Account.objects.filter(roles__account_role='client').distinct().count())
    print('  mechanics:', Account.objects.filter(roles__account_role='mechanic').distinct().count())
    print('  shop_owners:', Account.objects.filter(roles__account_role='shop_owner').distinct().count())
    print('  admins:', Account.objects.filter(Q(roles__account_role='admin') | Q(roles__account_role='head_admin')).distinct().count())
    print('  active_users:', Account.objects.filter(is_active=True).count())
    print('  banned_users:', AccountBan.objects.count())
    print('  unverified_users:', Account.objects.filter(is_verified=False).count())
    print('  total_bookings:', Booking.objects.count())
    print('  completed_bookings:', Booking.objects.filter(status="completed").count())
    print('  total_shops:', Shop.objects.count())
    print('  total_services:', Service.objects.count())
    print('  pending_reports:', ReportAccount.objects.filter(status="pending").count())
    print('  pending_disputes:', Dispute.objects.filter(status="pending").count())

    try:
        # User statistics
        total_users = Account.objects.count()
        clients = Account.objects.filter(roles__account_role='client').distinct().count()
        mechanics = Account.objects.filter(roles__account_role='mechanic').distinct().count()
        shop_owners = Account.objects.filter(roles__account_role='shop_owner').distinct().count()
        admins = Account.objects.filter(
            Q(roles__account_role='admin') | Q(roles__account_role='head_admin')
        ).distinct().count()
        active_users = Account.objects.filter(is_active=True).count()
        banned_users = AccountBan.objects.count()
        unverified_users = Account.objects.filter(is_verified=False).count()

        # Booking statistics
        total_bookings = Booking.objects.count()
        active_bookings = Booking.objects.filter(status='active').count()
        completed_bookings = Booking.objects.filter(status='completed').count()
        cancelled_bookings = Booking.objects.filter(status='cancelled').count()
        disputed_bookings = Booking.objects.filter(status='dispute').count()
        refunded_bookings = Booking.objects.filter(status='refunded').count()

        # Financial statistics
        total_revenue = Booking.objects.filter(status='completed').aggregate(
            total=Sum('amount_fee')
        )['total'] or 0
        
        pending_refunds_count = RefundedBooking.objects.filter(status='pending').count()
        pending_refund_amount = RefundedBooking.objects.filter(status='pending').aggregate(
            total=Sum('refund_amount')
        )['total'] or 0

        # Shop statistics
        total_shops = Shop.objects.count()
        verified_shops = Shop.objects.filter(is_verified=True).count()
        unverified_shops = Shop.objects.filter(is_verified=False).count()

        # Service statistics
        total_categories = ServiceCategory.objects.count()
        total_services = Service.objects.count()

        # Moderation statistics
        pending_reports = ReportAccount.objects.filter(status='pending').count()
        pending_disputes = Dispute.objects.filter(status='pending').count()

        return Response({
            'users': {
                'total': total_users,
                'clients': clients,
                'mechanics': mechanics,
                'shop_owners': shop_owners,
                'admins': admins,
                'active': active_users,
                'banned': banned_users,
                'unverified': unverified_users
            },
            'bookings': {
                'total': total_bookings,
                'active': active_bookings,
                'completed': completed_bookings,
                'cancelled': cancelled_bookings,
                'disputed': disputed_bookings,
                'refunded': refunded_bookings
            },
            'financial': {
                'total_revenue': str(total_revenue),
                'pending_refunds': pending_refunds_count,
                'refund_amount_pending': str(pending_refund_amount)
            },
            'shops': {
                'total': total_shops,
                'verified': verified_shops,
                'unverified': unverified_shops
            },
            'services': {
                'total_categories': total_categories,
                'total_services': total_services
            },
            'moderation': {
                'pending_reports': pending_reports,
                'pending_disputes': pending_disputes,
                'pending_refunds': pending_refunds_count
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': 'Failed to fetch dashboard statistics',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'service': 'MechConnect Authentication API'
    }, status=status.HTTP_200_OK)
