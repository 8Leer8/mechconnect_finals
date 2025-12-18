import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mechconnect_backend.settings')
django.setup()

from bookings.models import Booking
from requests.models import CustomRequest

# Get booking 26
booking = Booking.objects.get(booking_id=26)
print(f'Booking {booking.booking_id}: Current amount_fee = {booking.amount_fee}')
print(f'Request type: {booking.request.request_type}')
print(f'Request ID: {booking.request.request_id}')

# Get custom request if it exists
custom = CustomRequest.objects.filter(request=booking.request).first()
if custom:
    print(f'Custom request estimated_budget: {custom.estimated_budget}')
    if custom.estimated_budget:
        booking.amount_fee = custom.estimated_budget
        booking.save()
        print(f'✓ Updated booking amount_fee to: {booking.amount_fee}')
    else:
        print('✗ No estimated_budget set in custom request')
else:
    print('✗ No custom request found')
