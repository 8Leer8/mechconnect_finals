from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import Account, Notification, VerificationRejection


@api_view(['GET'])
@permission_classes([AllowAny])
def get_verifications(request):
    """
    Get all verification requests for head admin
    """
    try:
        from documents.models import MechanicDocument, ShopOwnerDocument
        
        # Get all users with mechanic or shop owner roles
        all_users = Account.objects.filter(
            roles__account_role__in=['mechanic', 'shop_owner']
        ).distinct().select_related('address', 'mechanic_profile', 'shop_owner_profile', 'verification_rejection').prefetch_related('roles')
        
        verifications_data = []
        for user in all_users:
            # Determine account type
            account_type = 'mechanic' if user.roles.filter(account_role='mechanic').exists() else 'shop_owner'
            
            # Determine status
            if user.is_verified:
                verification_status = 'approved'
            elif hasattr(user, 'verification_rejection'):
                verification_status = 'rejected'
            else:
                verification_status = 'pending'
            
            # Get profile data
            profile_data = {}
            documents_list = []
            
            if account_type == 'mechanic' and hasattr(user, 'mechanic_profile'):
                profile_data = {
                    'contact_number': user.mechanic_profile.contact_number,
                    'bio': user.mechanic_profile.bio,
                }
                
                # Fetch mechanic documents
                mechanic_docs = MechanicDocument.objects.filter(mechanic=user.mechanic_profile)
                for doc in mechanic_docs:
                    documents_list.append({
                        'id': doc.mechanic_document_id,
                        'name': doc.document_name,
                        'type': doc.document_type,
                        'url': doc.document_file,
                        'date_issued': doc.date_issued.isoformat() if doc.date_issued else None,
                        'date_expiry': doc.date_expiry.isoformat() if doc.date_expiry else None,
                        'uploaded_at': doc.uploaded_at.isoformat()
                    })
                    
            elif account_type == 'shop_owner' and hasattr(user, 'shop_owner_profile'):
                profile_data = {
                    'contact_number': user.shop_owner_profile.contact_number,
                    'bio': user.shop_owner_profile.bio,
                }
                
                # Fetch shop owner documents
                shop_owner_docs = ShopOwnerDocument.objects.filter(shop_owner=user.shop_owner_profile)
                for doc in shop_owner_docs:
                    documents_list.append({
                        'id': doc.shop_owner_document_id,
                        'name': doc.document_name,
                        'type': doc.document_type,
                        'url': doc.document_file,
                        'date_issued': doc.date_issued.isoformat() if doc.date_issued else None,
                        'date_expiry': doc.date_expiry.isoformat() if doc.date_expiry else None,
                        'uploaded_at': doc.uploaded_at.isoformat()
                    })
            
            # Get address
            if hasattr(user, 'address'):
                address = f"{user.address.city_municipality}, {user.address.province}"
                profile_data['address'] = address
            
            verifications_data.append({
                'id': user.acc_id,
                'user_id': user.acc_id,
                'username': user.username,
                'email': user.email,
                'full_name': f"{user.firstname} {user.lastname}",
                'account_type': account_type,
                'requested_at': user.created_at.isoformat(),
                'status': verification_status,
                'documents': documents_list,
                'profile_data': profile_data
            })
        
        return Response(verifications_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to fetch verifications',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_user_verification(request):
    """
    Approve a verification request
    """
    try:
        admin_id = request.data.get('admin_id')
        verification_id = request.data.get('verification_id')
        
        if not admin_id or not verification_id:
            return Response({
                'error': 'admin_id and verification_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=verification_id)
        
        # Verify the user
        user.is_verified = True
        user.save()
        
        # Remove any rejection record if exists
        VerificationRejection.objects.filter(account=user).delete()
        
        # Create notification
        Notification.objects.create(
            receiver=user,
            title='Verification Approved',
            message='Your account has been verified! You can now access all platform features.',
            type='info'
        )
        
        return Response({
            'message': 'User verified successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to verify user',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reject_verification(request):
    """
    Reject a verification request
    """
    try:
        admin_id = request.data.get('admin_id')
        verification_id = request.data.get('verification_id')
        reason = request.data.get('reason', 'Verification requirements not met')
        
        if not admin_id or not verification_id:
            return Response({
                'error': 'admin_id and verification_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Account, acc_id=verification_id)
        admin = get_object_or_404(Account, acc_id=admin_id)
        
        # Check if already verified
        if user.is_verified:
            return Response({
                'error': 'User is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update rejection record
        VerificationRejection.objects.update_or_create(
            account=user,
            defaults={
                'rejected_by': admin,
                'reason': reason
            }
        )
        
        # Create notification
        Notification.objects.create(
            receiver=user,
            title='Verification Rejected',
            message=f'Your verification request has been rejected. Reason: {reason}',
            type='warning'
        )
        
        return Response({
            'message': 'Verification rejected successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Failed to reject verification',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
