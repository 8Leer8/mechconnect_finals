"""
Script to create test bookings for client ID 10
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mechconnect_backend.settings')
django.setup()

from accounts.models import Client, Account
from requests.models import Request, CustomRequest
from bookings.models import Booking
from django.utils import timezone

# Get client with acc_id=10
try:
    account = Account.objects.get(acc_id=10)
    client = Client.objects.get(client_id=account)
    print(f"Found client: {client.client_id}")
    
    # Create a custom request
    request1 = Request.objects.create(
        client=client,
        request_type='custom',
        request_status='accepted'
    )
    
    CustomRequest.objects.create(
        request=request1,
        description='Test booking for cancelled status - Oil change and tire rotation'
    )
    
    # Create booking
    booking1 = Booking.objects.create(
        request=request1,
        status='active',
        amount_fee=2500.00
    )
    
    print(f"Created booking #{booking1.booking_id} with status: {booking1.status}")
    
    # Create second booking
    request2 = Request.objects.create(
        client=client,
        request_type='custom',
        request_status='accepted'
    )
    
    CustomRequest.objects.create(
        request=request2,
        description='Test booking for active status - Brake inspection and repair'
    )
    
    booking2 = Booking.objects.create(
        request=request2,
        status='active',
        amount_fee=1800.00
    )
    
    print(f"Created booking #{booking2.booking_id} with status: {booking2.status}")
    print("\nSuccessfully created 2 test bookings!")
    
except Client.DoesNotExist:
    print("Client not found for acc_id=10")
except Exception as e:
    print(f"Error: {e}")
