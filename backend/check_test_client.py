"""
Script to check and create a test client for testing emergency requests
Run this script from the backend directory: python check_test_client.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mechconnect_backend.settings')
django.setup()

from accounts.models import Account, Client
from django.contrib.auth.hashers import make_password

def check_and_create_test_client():
    """Check if client_id=1 exists, create if not"""
    
    print("=" * 60)
    print("Checking for test client (client_id=1)...")
    print("=" * 60)
    
    # Check if client exists
    try:
        client = Client.objects.get(client_id=1)
        account = client.account
        print(f"\n✅ Client found!")
        print(f"   Client ID: {client.client_id}")
        print(f"   Account ID: {account.acc_id}")
        print(f"   Email: {account.email}")
        print(f"   First Name: {account.first_name}")
        print(f"   Last Name: {account.last_name}")
        print(f"   Phone: {account.phone_number}")
        print("\n✅ You can use this client for testing!")
        return True
        
    except Client.DoesNotExist:
        print("\n❌ Client with ID=1 not found!")
        print("\nAttempting to create test client...")
        
        try:
            # Check if account with ID=1 exists
            try:
                account = Account.objects.get(acc_id=1)
                print(f"   Found existing account: {account.email}")
            except Account.DoesNotExist:
                # Create test account
                account = Account.objects.create(
                    acc_id=1,
                    email='testclient@mechconnect.com',
                    password=make_password('TestPass123'),
                    first_name='Test',
                    last_name='Client',
                    phone_number='09123456789',
                    account_type='client',
                    verification_status='verified'
                )
                print(f"   Created new account: {account.email}")
            
            # Create client
            client = Client.objects.create(
                client_id=1,
                account=account
            )
            
            print(f"\n✅ Test client created successfully!")
            print(f"   Client ID: {client.client_id}")
            print(f"   Email: {account.email}")
            print(f"   Password: TestPass123")
            print(f"\n✅ You can now test emergency requests!")
            return True
            
        except Exception as e:
            print(f"\n❌ Error creating test client: {str(e)}")
            print("\nPlease check your database connection and try again.")
            return False

    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return False

def list_all_clients():
    """List all clients in the database"""
    print("\n" + "=" * 60)
    print("All Clients in Database:")
    print("=" * 60)
    
    clients = Client.objects.select_related('account').all()[:10]
    
    if not clients:
        print("\n❌ No clients found in database!")
        return
    
    for client in clients:
        account = client.account
        print(f"\nClient ID: {client.client_id}")
        print(f"   Email: {account.email}")
        print(f"   Name: {account.first_name} {account.last_name}")
        print(f"   Phone: {account.phone_number}")
        print(f"   Verified: {account.verification_status}")

if __name__ == '__main__':
    print("\n🔧 MechConnect - Test Client Checker\n")
    
    # Check/create test client
    success = check_and_create_test_client()
    
    # List all clients
    list_all_clients()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Setup complete! You can now test emergency requests.")
    else:
        print("❌ Setup incomplete. Please resolve errors above.")
    print("=" * 60 + "\n")
