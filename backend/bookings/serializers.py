from rest_framework import serializers
from .models import (
    Booking, ActiveBooking, RescheduledBooking, CancelledBooking,
    BackJobsBooking, Dispute, RefundedBooking, CompletedBooking
)
from accounts.models import Account, Client, AccountAddress
from requests.models import Request


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    client_address = serializers.SerializerMethodField()
    request_summary = serializers.SerializerMethodField()
    request_type = serializers.CharField(source='request.request_type', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'request', 'status', 'amount_fee', 'booked_at',
            'updated_at', 'completed_at', 'client_name', 'provider_name',
            'client_address', 'request_summary', 'request_type'
        ]
        read_only_fields = ['booking_id', 'booked_at', 'updated_at']
    
    def get_client_name(self, obj):
        if obj.request.client and obj.request.client.client_id:
            return f"{obj.request.client.client_id.firstname} {obj.request.client.client_id.lastname}"
        return "Unknown Client"
    
    def get_provider_name(self, obj):
        if obj.request.provider:
            return f"{obj.request.provider.firstname} {obj.request.provider.lastname}"
        return "No Provider Assigned"
    
    def get_client_address(self, obj):
        try:
            address = AccountAddress.objects.get(acc_add_id=obj.request.client.client_id)
            return {
                'house_building_number': address.house_building_number,
                'street_name': address.street_name,
                'subdivision_village': address.subdivision_village,
                'barangay': address.barangay,
                'city_municipality': address.city_municipality,
                'province': address.province,
                'region': address.region,
                'postal_code': address.postal_code
            }
        except AccountAddress.DoesNotExist:
            return None
    
    def get_request_summary(self, obj):
        """Get a summary of the request based on type"""
        if obj.request.request_type == 'custom' and hasattr(obj.request, 'custom_request'):
            description = obj.request.custom_request.description or "No description"
            return description[:100] + "..." if len(description) > 100 else description
        elif obj.request.request_type == 'direct' and hasattr(obj.request, 'direct_request'):
            service_name = obj.request.direct_request.service.name if obj.request.direct_request.service else "Unknown Service"
            return f"Direct service request: {service_name}"
        elif obj.request.request_type == 'emergency' and hasattr(obj.request, 'emergency_request'):
            description = obj.request.emergency_request.description or "Emergency request"
            return description[:100] + "..." if len(description) > 100 else description
        return "Booking details unavailable"


class ActiveBookingSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = ActiveBooking
        fields = [
            'active_booking_id', 'booking', 'status', 'before_picture_service',
            'after_picture_service', 'started_at', 'updated_at', 'booking_details'
        ]


class CompletedBookingSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    
    class Meta:
        model = CompletedBooking
        fields = [
            'completed_booking_id', 'booking', 'completed_at', 'total_amount',
            'notes', 'booking_details'
        ]


class RescheduledBookingSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RescheduledBooking
        fields = [
            'rescheduled_booking_id', 'booking', 'reason', 'requested_by',
            'requested_by_role', 'status', 'requested_at', 'updated_at',
            'booking_details', 'requested_by_name'
        ]
    
    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return f"{obj.requested_by.firstname} {obj.requested_by.lastname}"
        return "Unknown"


class CancelledBookingSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    cancelled_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CancelledBooking
        fields = [
            'cancelled_booking_id', 'booking', 'reason', 'cancelled_by',
            'cancelled_by_role', 'status', 'cancelled_at', 'updated_at',
            'booking_details', 'cancelled_by_name'
        ]
    
    def get_cancelled_by_name(self, obj):
        if obj.cancelled_by:
            return f"{obj.cancelled_by.firstname} {obj.cancelled_by.lastname}"
        return "Unknown"


class BackJobsBookingSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BackJobsBooking
        fields = [
            'back_jobs_booking_id', 'booking', 'requested_by', 'reason', 'status',
            'created_at', 'updated_at', 'completed_at', 'booking_details', 'requested_by_name'
        ]
    
    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return f"{obj.requested_by.firstname} {obj.requested_by.lastname}"
        return "Unknown"


class DisputeSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    complainer_name = serializers.SerializerMethodField()
    complaint_against_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Dispute
        fields = [
            'dispute_id', 'booking', 'complainer', 'complainer_role',
            'complaint_against', 'complaint_against_role', 'admin',
            'issue_description', 'issue_picture', 'resolution_notes',
            'status', 'created_at', 'updated_at', 'resolved_at',
            'booking_details', 'complainer_name', 'complaint_against_name'
        ]
    
    def get_complainer_name(self, obj):
        if obj.complainer:
            return f"{obj.complainer.firstname} {obj.complainer.lastname}"
        return "Unknown"
    
    def get_complaint_against_name(self, obj):
        if obj.complaint_against:
            return f"{obj.complaint_against.firstname} {obj.complaint_against.lastname}"
        return "Unknown"


class RefundedBookingSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RefundedBooking
        fields = [
            'refunded_booking_id', 'booking', 'requested_by', 'requested_by_role',
            'admin', 'reason', 'refund_amount', 'status', 'requested_at',
            'processed_at', 'updated_at', 'booking_details', 'requested_by_name'
        ]
    
    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return f"{obj.requested_by.firstname} {obj.requested_by.lastname}"
        return "Unknown"


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing bookings"""
    client_name = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    request_summary = serializers.SerializerMethodField()
    request_type = serializers.CharField(source='request.request_type', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'status', 'amount_fee', 'booked_at',
            'client_name', 'provider_name', 'request_summary', 'request_type'
        ]
    
    def get_client_name(self, obj):
        if obj.request.client and obj.request.client.client_id:
            return f"{obj.request.client.client_id.firstname} {obj.request.client.client_id.lastname}"
        return "Unknown Client"
    
    def get_provider_name(self, obj):
        if obj.request.provider:
            return f"{obj.request.provider.firstname} {obj.request.provider.lastname}"
        return "No Provider Assigned"
    
    def get_request_summary(self, obj):
        """Get a summary of the request based on type"""
        if obj.request.request_type == 'custom' and hasattr(obj.request, 'custom_request'):
            description = obj.request.custom_request.description or "No description"
            return description[:100] + "..." if len(description) > 100 else description
        elif obj.request.request_type == 'direct' and hasattr(obj.request, 'direct_request'):
            service_name = obj.request.direct_request.service.name if obj.request.direct_request.service else "Unknown Service"
            return f"Direct service request: {service_name}"
        elif obj.request.request_type == 'emergency' and hasattr(obj.request, 'emergency_request'):
            description = obj.request.emergency_request.description or "Emergency request"
            return description[:100] + "..." if len(description) > 100 else description
        return "Booking details unavailable"