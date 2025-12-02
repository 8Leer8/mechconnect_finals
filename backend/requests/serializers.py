from rest_framework import serializers
from .models import Request, CustomRequest, QuotedRequestItem, DirectRequest, EmergencyRequest
from accounts.models import Account, Client, AccountAddress
from services.models import Service


class QuotedRequestItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotedRequestItem
        fields = ['custom_request_item_id', 'item', 'price']


class CustomRequestSerializer(serializers.ModelSerializer):
    quoted_items = QuotedRequestItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = CustomRequest
        fields = ['request', 'description', 'concern_picture', 'providers_note', 'quoted_items']


class DirectRequestSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = DirectRequest
        fields = ['request', 'service', 'service_name', 'service_price']


class EmergencyRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyRequest
        fields = ['request', 'description', 'concern_picture', 'providers_note']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountAddress
        fields = [
            'house_building_number', 'street_name', 'subdivision_village',
            'barangay', 'city_municipality', 'province', 'region', 'postal_code'
        ]


class RequestSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.client_id.firstname', read_only=True)
    client_contact = serializers.CharField(source='client.contact_number', read_only=True)
    provider_name = serializers.SerializerMethodField()
    client_address = serializers.SerializerMethodField()
    custom_request = CustomRequestSerializer(read_only=True)
    direct_request = DirectRequestSerializer(read_only=True)
    emergency_request = EmergencyRequestSerializer(read_only=True)
    
    class Meta:
        model = Request
        fields = [
            'request_id', 'client', 'provider', 'request_type', 'request_status',
            'created_at', 'updated_at', 'client_name', 'client_contact', 
            'provider_name', 'client_address', 'custom_request', 'direct_request', 'emergency_request'
        ]
        read_only_fields = ['request_id', 'created_at', 'updated_at']
    
    def get_provider_name(self, obj):
        if obj.provider:
            return f"{obj.provider.firstname} {obj.provider.lastname}"
        return None
    
    def get_client_address(self, obj):
        try:
            address = AccountAddress.objects.get(acc_add_id=obj.client.client_id)
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


class CreateCustomRequestSerializer(serializers.ModelSerializer):
    """Serializer for creating custom requests"""
    description = serializers.CharField(max_length=2000)
    concern_picture = serializers.CharField(max_length=1024, required=False, allow_blank=True)
    estimated_budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    
    # Location fields
    house_building_number = serializers.CharField(max_length=255, required=False, allow_blank=True)
    street_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    subdivision_village = serializers.CharField(max_length=255, required=False, allow_blank=True)
    barangay = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city_municipality = serializers.CharField(max_length=255, required=False, allow_blank=True)
    province = serializers.CharField(max_length=255, required=False, allow_blank=True)
    region = serializers.CharField(max_length=255, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    # Schedule fields
    schedule_type = serializers.ChoiceField(choices=[('urgent', 'Urgent'), ('freely', 'Freely')])
    scheduled_date = serializers.DateField(required=False, allow_null=True)
    scheduled_time = serializers.TimeField(required=False, allow_null=True)
    
    # Client ID (should be provided from authentication or frontend)
    client_id = serializers.IntegerField()
    
    # Provider ID (optional - for requests made directly to a specific mechanic)
    provider_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = CustomRequest
        fields = [
            'description', 'concern_picture', 'estimated_budget',
            'house_building_number', 'street_name', 'subdivision_village',
            'barangay', 'city_municipality', 'province', 'region', 'postal_code',
            'schedule_type', 'scheduled_date', 'scheduled_time', 'client_id', 'provider_id'
        ]
    
    def validate_client_id(self, value):
        """Validate that the client exists"""
        try:
            Client.objects.get(client_id=value)
            return value
        except Client.DoesNotExist:
            raise serializers.ValidationError("Invalid client ID")
    
    def validate_provider_id(self, value):
        """Validate that the provider exists if provided"""
        if value is not None:
            try:
                Account.objects.get(acc_id=value)
                return value
            except Account.DoesNotExist:
                raise serializers.ValidationError("Invalid provider ID")
        return value
    
    def validate(self, data):
        """Validate schedule data based on type"""
        if data.get('schedule_type') == 'freely':
            if not data.get('scheduled_date'):
                raise serializers.ValidationError("Scheduled date is required for freely scheduled requests")
            if not data.get('scheduled_time'):
                raise serializers.ValidationError("Scheduled time is required for freely scheduled requests")
        return data


class RequestListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing requests"""
    client_name = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    request_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = Request
        fields = [
            'request_id', 'request_type', 'request_status', 'created_at',
            'client_name', 'provider_name', 'request_summary'
        ]
    
    def get_client_name(self, obj):
        if obj.client and obj.client.client_id:
            return f"{obj.client.client_id.firstname} {obj.client.client_id.lastname}"
        return "Unknown Client"
    
    def get_provider_name(self, obj):
        if obj.provider:
            return f"{obj.provider.firstname} {obj.provider.lastname}"
        return "No Provider Assigned"
    
    def get_request_summary(self, obj):
        """Get a summary of the request based on type"""
        if obj.request_type == 'custom' and hasattr(obj, 'custom_request'):
            description = obj.custom_request.description or "No description"
            return description[:100] + "..." if len(description) > 100 else description
        elif obj.request_type == 'direct' and hasattr(obj, 'direct_request'):
            service_name = obj.direct_request.service.name if obj.direct_request.service else "Unknown Service"
            return f"Direct service request: {service_name}"
        elif obj.request_type == 'emergency' and hasattr(obj, 'emergency_request'):
            description = obj.emergency_request.description or "Emergency request"
            return description[:100] + "..." if len(description) > 100 else description
        return "Request details unavailable"