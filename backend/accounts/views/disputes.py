from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404

from ..models import Notification
from bookings.models import Dispute, Booking


@api_view(['GET'])
@permission_classes([AllowAny])
def get_disputes(request):
    """
    Get all disputes for head admin
    """
    try:
        from requests.models import Request
        
        disputes = Dispute.objects.all().select_related(
            'booking__request__client__client_id',
            'booking__request__provider',
            'complainer',
            'complaint_against'
        ).order_by('-created_at')
        
        disputes_data = []
        for dispute in disputes:
            booking = dispute.booking
            request_obj = booking.request
            
            # Get client from request
            client_account = request_obj.client.client_id if request_obj and request_obj.client else None
            # Get provider (mechanic) from request
            provider_account = request_obj.provider if request_obj else None
            
            disputes_data.append({
                'id': dispute.dispute_id,
                'booking_id': booking.booking_id,
                'client_id': client_account.acc_id if client_account else None,
                'client_name': f"{client_account.firstname} {client_account.lastname}" if client_account else "Unknown",
                'client_email': client_account.email if client_account else "",
                'mechanic_id': provider_account.acc_id if provider_account else None,
                'mechanic_name': f"{provider_account.firstname} {provider_account.lastname}" if provider_account else "Unknown",
                'mechanic_email': provider_account.email if provider_account else "",
                'reason': dispute.issue_description or 'No reason provided',
                'description': dispute.issue_description or 'No description available',
                'filed_at': dispute.created_at.isoformat(),
                'status': dispute.status,
                'resolved_at': dispute.resolved_at.isoformat() if dispute.resolved_at else None,
                'resolution_notes': dispute.resolution_notes
            })
        
        return Response(disputes_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch disputes',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def resolve_dispute(request):
    """
    Resolve a dispute
    """
    try:
        admin_id = request.data.get('admin_id')
        dispute_id = request.data.get('dispute_id')
        resolution = request.data.get('resolution', 'resolved')
        resolution_notes = request.data.get('resolution_notes', '')
        
        if not admin_id or not dispute_id:
            return Response({
                'error': 'admin_id and dispute_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        dispute = get_object_or_404(Dispute, dispute_id=dispute_id)
        
        # Update dispute
        dispute.status = resolution
        dispute.resolution_notes = resolution_notes
        dispute.resolved_at = timezone.now()
        dispute.save()
        
        # Notify both parties
        booking = dispute.booking
        if booking.client:
            Notification.objects.create(
                receiver=booking.client.client_id,
                title='Dispute Resolved',
                message=f'Your dispute for booking #{booking.booking_id} has been resolved.',
                type='info'
            )
        
        if booking.mechanic:
            Notification.objects.create(
                receiver=booking.mechanic.mechanic_id,
                title='Dispute Resolved',
                message=f'The dispute for booking #{booking.booking_id} has been resolved.',
                type='info'
            )
        
        return Response({
            'message': 'Dispute resolved successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to resolve dispute',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
