from bookings.models import Booking
from accounts.models import Client, Account

# Get client
try:
    account = Account.objects.get(acc_id=10)
    print(f"Account found: {account}")
    
    try:
        client = Client.objects.get(client_id=10)
        print(f"Client found: {client}")
        print(f"Client primary key: {client.client_id.acc_id}")
        
        # Get all bookings for this client
        bookings = Booking.objects.filter(request__client=client)
        print(f"\nTotal bookings for client: {bookings.count()}")
        
        for booking in bookings:
            print(f"Booking #{booking.booking_id} - Status: {booking.status}")
            print(f"  Request ID: {booking.request.request_id}")
            print(f"  Client: {booking.request.client}")
            
    except Client.DoesNotExist:
        print("Client profile not found for account 10")
        
except Account.DoesNotExist:
    print("Account 10 not found")
