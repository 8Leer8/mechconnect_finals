from django.db import models

class Request(models.Model):
    REQUEST_TYPE_CHOICES = [
        ('custom', 'custom'),
        ('direct', 'direct'),
        ('emergency', 'emergency'),
    ]
    REQUEST_STATUS_CHOICES = [
        ('pending', 'pending'),
        ('qouted', 'qouted'),
        ('accepted', 'accepted'),
        ('rejected', 'rejected'),
    ]

    request_id = models.AutoField(primary_key=True)
    client = models.ForeignKey('accounts.Client', on_delete=models.CASCADE, related_name='requests')
    provider = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='provided_requests')
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    request_status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CustomRequest(models.Model):
    request = models.OneToOneField('requests.Request', primary_key=True, on_delete=models.CASCADE, related_name='custom_request')
    description = models.TextField(null=True, blank=True)
    concern_picture = models.CharField(max_length=1024, null=True, blank=True)
    providers_note = models.TextField(null=True, blank=True)


class QuotedRequestItem(models.Model):
    custom_request_item_id = models.AutoField(primary_key=True)
    custom_request = models.ForeignKey('requests.CustomRequest', on_delete=models.CASCADE, related_name='quoted_items')
    item = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)


class DirectRequest(models.Model):
    request = models.OneToOneField('requests.Request', primary_key=True, on_delete=models.CASCADE, related_name='direct_request')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='direct_requests')


class DirectRequestAddOn(models.Model):
    direct_request_add_on_id = models.AutoField(primary_key=True)
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='direct_request_add_ons')
    service_add_on = models.ForeignKey('services.ServiceAddOn', on_delete=models.CASCADE, related_name='direct_request_addon_of')


class EmergencyRequest(models.Model):
    request = models.OneToOneField('requests.Request', primary_key=True, on_delete=models.CASCADE, related_name='emergency_request')
    description = models.TextField(null=True, blank=True)
    concern_picture = models.CharField(max_length=1024, null=True, blank=True)
    providers_note = models.TextField(null=True, blank=True)
