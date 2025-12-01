from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404

from ..models import ReportAccount, Notification


@api_view(['GET'])
@permission_classes([AllowAny])
def get_reports(request):
    """
    Get all account reports for head admin
    """
    try:
        reports = ReportAccount.objects.all().select_related(
            'reporter',
            'reported'
        ).order_by('-reported_at')
        
        reports_data = []
        for report in reports:
            reports_data.append({
                'id': report.rep_acc_id,
                'reporter_id': report.reporter.acc_id,
                'reporter_name': f"{report.reporter.firstname} {report.reporter.lastname}",
                'reporter_email': report.reporter.email,
                'reported_id': report.reported.acc_id,
                'reported_name': f"{report.reported.firstname} {report.reported.lastname}",
                'reported_email': report.reported.email,
                'reason': report.reason,
                'status': report.status,
                'reported_at': report.reported_at.isoformat(),
                'reviewed_at': report.reviewed_at.isoformat() if report.reviewed_at else None,
                'admin_action_notes': report.admin_action_notes
            })
        
        return Response(reports_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch reports',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def review_report(request):
    """
    Review a report and take action
    """
    try:
        admin_id = request.data.get('admin_id')
        report_id = request.data.get('report_id')
        status_update = request.data.get('status', 'reviewed')
        admin_action_notes = request.data.get('admin_action_notes', '')
        
        if not admin_id or not report_id:
            return Response({
                'error': 'admin_id and report_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        report = get_object_or_404(ReportAccount, rep_acc_id=report_id)
        
        # Update report
        report.status = status_update
        report.admin_action_notes = admin_action_notes
        report.reviewed_at = timezone.now()
        report.save()
        
        # Notify reporter
        Notification.objects.create(
            receiver=report.reporter,
            title='Report Reviewed',
            message=f'Your report against {report.reported.username} has been reviewed.',
            type='info'
        )
        
        return Response({
            'message': 'Report reviewed successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to review report',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def dismiss_report(request):
    """
    Dismiss a report
    """
    try:
        admin_id = request.data.get('admin_id')
        report_id = request.data.get('report_id')
        
        if not admin_id or not report_id:
            return Response({
                'error': 'admin_id and report_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        report = get_object_or_404(ReportAccount, rep_acc_id=report_id)
        
        # Delete the report
        report.delete()
        
        return Response({
            'message': 'Report dismissed successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to dismiss report',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
