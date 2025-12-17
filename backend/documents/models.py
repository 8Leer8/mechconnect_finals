from django.db import models

class MechanicDocument(models.Model):
    mechanic_document_id = models.AutoField(primary_key=True)
    mechanic = models.ForeignKey('accounts.Mechanic', on_delete=models.CASCADE, related_name='documents')
    document_name = models.CharField(max_length=255)
    DOCUMENT_TYPE_CHOICES = [('license','license'),('certification','certification'),('ID','ID'),('others','others')]
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.TextField()  # Changed from CharField to TextField to support base64-encoded files
    date_issued = models.DateField(null=True, blank=True)
    date_expiry = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ShopOwnerDocument(models.Model):
    shop_owner_document_id = models.AutoField(primary_key=True)
    shop_owner = models.ForeignKey('accounts.ShopOwner', on_delete=models.CASCADE, related_name='documents')
    document_name = models.CharField(max_length=255)
    DOCUMENT_TYPE_CHOICES = [('business_permit','business_permit'),('mayor_permit','mayor_permit'),('BIR_registration','BIR_registration'),('ID','ID'),('others','others')]
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.TextField()  # Changed from CharField to TextField to support base64-encoded files
    date_issued = models.DateField(null=True, blank=True)
    date_expiry = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ShopDocument(models.Model):
    shop_document_id = models.AutoField(primary_key=True)
    shop = models.ForeignKey('shop.Shop', on_delete=models.CASCADE, related_name='documents')
    document_name = models.CharField(max_length=255)
    DOCUMENT_TYPE_CHOICES = [('business_permit','business_permit'),('mayor_permit','mayor_permit'),('BIR_registration','BIR_registration'),('occupancy_permit','occupancy_permit'),('others','others')]
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.TextField()  # Changed from CharField to TextField to support base64-encoded files
    date_issued = models.DateField(null=True, blank=True)
    date_expiry = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
