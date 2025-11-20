from django.db import models

class Specialty(models.Model):
    specialty_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MechanicSpecialty(models.Model):
    mechanic_specialty_id = models.AutoField(primary_key=True)
    mechanic = models.ForeignKey('accounts.Mechanic', on_delete=models.CASCADE, related_name='specialties')
    specialty = models.ForeignKey('specialties.Specialty', on_delete=models.CASCADE, related_name='mechanic_links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('mechanic', 'specialty'),)


class ShopSpecialty(models.Model):
    shop_specialty_id = models.AutoField(primary_key=True)
    shop = models.ForeignKey('shop.Shop', on_delete=models.CASCADE, related_name='specialties')
    specialty = models.ForeignKey('specialties.Specialty', on_delete=models.CASCADE, related_name='shop_links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('shop', 'specialty'),)
