from django.db import models
from accounts.models import ShopOwner, Mechanic

class Shop(models.Model):
    shop_id = models.AutoField(primary_key=True)
    shop_owner = models.ForeignKey(ShopOwner, on_delete=models.CASCADE, related_name='shops')

    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    profile_picture = models.CharField(max_length=1024, null=True, blank=True)
    cover_photo = models.CharField(max_length=1024, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ShopMechanic(models.Model):
    shop_mechanic_id = models.AutoField(primary_key=True)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='shop_mechanics')
    mechanic = models.ForeignKey(Mechanic, on_delete=models.CASCADE, related_name='shop_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('shop', 'mechanic')

    def __str__(self):
        return f"{self.mechanic} @ {self.shop}"
