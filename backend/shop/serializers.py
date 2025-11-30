from rest_framework import serializers
from .models import Shop, ShopMechanic
from accounts.models import AccountAddress


class ShopDiscoverySerializer(serializers.ModelSerializer):
    shop_id = serializers.IntegerField(read_only=True)
    shop_name = serializers.CharField(read_only=True)
    contact_number = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    service_banner = serializers.CharField(read_only=True)
    location = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_jobs = serializers.SerializerMethodField()
    total_mechanics = serializers.SerializerMethodField()
    
    class Meta:
        model = Shop
        fields = [
            'shop_id', 'shop_name', 'contact_number', 'description', 
            'service_banner', 'location', 'average_rating', 'total_jobs', 
            'total_mechanics', 'status'
        ]
    
    def get_location(self, obj):
        """Get shop location from shop owner's address"""
        if obj.shop_owner and hasattr(obj.shop_owner.shop_owner_id, 'address') and obj.shop_owner.shop_owner_id.address:
            address = obj.shop_owner.shop_owner_id.address
            location_parts = []
            if address.city_municipality:
                location_parts.append(address.city_municipality)
            if address.province:
                location_parts.append(address.province)
            return ", ".join(location_parts) if location_parts else "Location not specified"
        return "Location not specified"
    
    def get_average_rating(self, obj):
        """Get shop average rating from ratings model"""
        # For now, return a calculated rating based on shop services and mechanics
        # This would be replaced with actual rating calculation from ratings app
        base_rating = 4.0
        service_count = obj.shop_services.count() if hasattr(obj, 'shop_services') else 0
        mechanic_count = obj.shop_mechanics.count() if hasattr(obj, 'shop_mechanics') else 0
        
        # Simple calculation: more services/mechanics = higher rating
        rating_boost = min(1.0, (service_count + mechanic_count) * 0.1)
        final_rating = min(5.0, base_rating + rating_boost)
        return f"{final_rating:.1f}"
    
    def get_total_jobs(self, obj):
        """Get total completed jobs for shop from bookings/requests model"""
        # For now, return an estimated job count based on shop metrics
        # This would be replaced with actual job count from bookings/requests app
        service_count = obj.shop_services.count() if hasattr(obj, 'shop_services') else 0
        mechanic_count = obj.shop_mechanics.count() if hasattr(obj, 'shop_mechanics') else 0
        
        # Estimate: each service type * mechanics * average jobs per combo
        estimated_jobs = (service_count + 1) * (mechanic_count + 1) * 50
        return min(1000, max(100, estimated_jobs))  # Cap between 100-1000
    
    def get_total_mechanics(self, obj):
        """Get total mechanics in shop"""
        return obj.shop_mechanics.count()
