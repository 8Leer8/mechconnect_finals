from django.db import models
from shop.models import Shop

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Service(models.Model):
    service_id = models.AutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='services')
    service_name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.service_name


class ServiceImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image_path = models.CharField(max_length=1024)

    def __str__(self):
        return f"Image for {self.service}"


class ShopService(models.Model):
    shop_service_id = models.AutoField(primary_key=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='shop_services')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='shop_services')
    base_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ('shop', 'service')

    def __str__(self):
        return f"{self.shop} offers {self.service} @ {self.base_price}"
