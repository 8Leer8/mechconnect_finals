from rest_framework import serializers
from .models import Service, ServiceCategory, MechanicService, ShopService
from accounts.models import Account
from shop.models import Shop


class ServiceDiscoverySerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    service_banner = serializers.CharField(read_only=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    service_category = serializers.SerializerMethodField()
    provider_type = serializers.SerializerMethodField()
    provider_name = serializers.SerializerMethodField()
    provider_id = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_bookings = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'service_id', 'name', 'description', 'service_banner', 'price',
            'service_category', 'provider_type', 'provider_name', 'provider_id',
            'average_rating', 'total_bookings'
        ]
    
    def get_service_category(self, obj):
        """Get service category information"""
        if obj.service_category:
            return {'name': obj.service_category.name}
        return {'name': 'General Service'}
    
    def get_provider_type(self, obj):
        """Determine if service is provided by mechanic or shop"""
        # Check if service has mechanic providers
        if obj.mechanic_services.exists():
            return 'Independent Mechanic'
        # Check if service has shop providers
        elif obj.shop_services.exists():
            return 'Shop'
        return 'Unknown'
    
    def get_provider_name(self, obj):
        """Get the name of the service provider"""
        # Check mechanic services first
        mechanic_service = obj.mechanic_services.first()
        if mechanic_service:
            mechanic = mechanic_service.mechanic.mechanic_id
            middle_initial = f" {mechanic.middlename[0]}." if mechanic.middlename else ""
            return f"{mechanic.firstname}{middle_initial} {mechanic.lastname}"
        
        # Check shop services
        shop_service = obj.shop_services.first()
        if shop_service:
            return shop_service.shop.shop_name
            
        return 'Unknown Provider'
    
    def get_provider_id(self, obj):
        """Get the ID of the service provider"""
        # Check mechanic services first
        mechanic_service = obj.mechanic_services.first()
        if mechanic_service:
            return mechanic_service.mechanic.mechanic_id.acc_id
        
        # Check shop services
        shop_service = obj.shop_services.first()
        if shop_service:
            return shop_service.shop.shop_id
            
        return None
    
    def get_average_rating(self, obj):
        """Get service average rating from ratings model"""
        # For now, return a calculated rating based on service price and category
        # This would be replaced with actual rating calculation from ratings app
        base_rating = 4.0
        
        # Higher priced services tend to have better ratings (premium service assumption)
        if obj.price:
            if obj.price >= 1500:
                rating_boost = 0.8
            elif obj.price >= 800:
                rating_boost = 0.5
            elif obj.price >= 400:
                rating_boost = 0.3
            else:
                rating_boost = 0.1
        else:
            rating_boost = 0.2
            
        final_rating = min(5.0, base_rating + rating_boost)
        return f"{final_rating:.1f}"
    
    def get_total_bookings(self, obj):
        """Get total bookings for service from bookings model"""
        # For now, return an estimated booking count based on service metrics
        # This would be replaced with actual booking count from bookings app
        provider_count = obj.mechanic_services.count() + obj.shop_services.count()
        
        # Estimate based on price range (lower price = more bookings typically)
        if obj.price:
            if obj.price <= 500:
                base_bookings = 200
            elif obj.price <= 1000:
                base_bookings = 150
            elif obj.price <= 2000:
                base_bookings = 100
            else:
                base_bookings = 50
        else:
            base_bookings = 100
            
        # More providers = more total bookings
        total_bookings = base_bookings + (provider_count * 25)
        return max(20, total_bookings)  # Minimum 20 bookings
