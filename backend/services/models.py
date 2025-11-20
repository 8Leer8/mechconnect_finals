from django.db import models

class ServiceCategory(models.Model):
    service_category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    worth_token = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Service(models.Model):
    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    service_banner = models.TextField(null=True, blank=True)
    service_category = models.ForeignKey('services.ServiceCategory', on_delete=models.SET_NULL, null=True, related_name='services')
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class MechanicService(models.Model):
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='mechanic_services')
    mechanic = models.ForeignKey('accounts.Mechanic', on_delete=models.CASCADE, related_name='mechanic_services')

    class Meta:
        unique_together = (('service', 'mechanic'),)


class ShopService(models.Model):
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='shop_services')
    shop = models.ForeignKey('shop.Shop', on_delete=models.CASCADE, related_name='shop_services')

    class Meta:
        unique_together = (('service', 'shop'),)


class ShopServiceMechanic(models.Model):
    shop_service_mechanic_id = models.AutoField(primary_key=True)
    shop_service = models.ForeignKey('services.ShopService', on_delete=models.CASCADE, related_name='shop_service_mechanics')
    mechanic = models.ForeignKey('accounts.Mechanic', on_delete=models.CASCADE, related_name='shop_service_assignments')


class ServiceAddOn(models.Model):
    service_add_on_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='add_ons')
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ServiceInclude(models.Model):
    service_include_id = models.AutoField(primary_key=True)
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='includes')
    include_description = models.TextField()
