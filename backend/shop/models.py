from django.db import models

class Shop(models.Model):
    shop_id = models.AutoField(primary_key=True)
    shop_owner = models.ForeignKey('accounts.ShopOwner', on_delete=models.SET_NULL, null=True, blank=True, related_name='shops')
    shop_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    website = models.CharField(max_length=512, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    service_banner = models.CharField(max_length=1024, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    STATUS_CHOICES = [('open', 'Open'), ('closed', 'Closed')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.shop_name


class ShopMechanic(models.Model):
    shop_mechanic_id = models.AutoField(primary_key=True)
    shop = models.ForeignKey('shop.Shop', on_delete=models.CASCADE, related_name='shop_mechanics')
    mechanic = models.ForeignKey('accounts.Mechanic', on_delete=models.CASCADE, related_name='shop_memberships')
    date_joined = models.DateField(null=True, blank=True)
