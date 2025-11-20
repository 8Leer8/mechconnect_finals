from django.db import models
from accounts.models import Client, Account
from services.models import Service

class Request(models.Model):
    REQUEST_TYPE_CHOICES = [
        ('custom', 'Custom'),
        ('direct', 'Direct'),
        ('emergency', 'Emergency'),
    ]
    REQUEST_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('quoted', 'Quoted'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    request_id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='requests')
    provider = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='provided_requests')

    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    request_status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request {self.request_id} by {self.client}"


class DirectRequest(models.Model):
    request = models.OneToOneField(Request, primary_key=True, on_delete=models.CASCADE, related_name='direct_request')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='direct_requests')

    def __str__(self):
        return f"DirectRequest {self.request_id} → {self.service}"


class CustomRequest(models.Model):
    request = models.OneToOneField(Request, primary_key=True, on_delete=models.CASCADE, related_name='custom_request')
    description = models.TextField(null=True, blank=True)
    concern_picture = models.CharField(max_length=1024, null=True, blank=True)
    providers_note = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"CustomRequest {self.request_id}"


class EmergencyRequest(models.Model):
    request = models.OneToOneField(Request, primary_key=True, on_delete=models.CASCADE, related_name='emergency_request')
    description = models.TextField(null=True, blank=True)
    concern_picture = models.CharField(max_length=1024, null=True, blank=True)

    def __str__(self):
        return f"EmergencyRequest {self.request_id}"
