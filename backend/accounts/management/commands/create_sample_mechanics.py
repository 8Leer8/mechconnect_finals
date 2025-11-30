from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from accounts.models import Account, AccountRole, Mechanic, AccountAddress
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Create sample mechanic data for testing'

    def handle(self, *args, **options):
        # Sample mechanic data
        mechanics_data = [
            {
                'firstname': 'Mike', 
                'lastname': 'Johnson', 
                'username': 'mike_johnson',
                'email': 'mike.johnson@example.com',
                'contact_number': '+639171234567',
                'bio': 'Independent Mechanic with 5+ years experience in automotive repair',
                'city': 'Tarlac', 
                'province': 'Tarlac',
                'rating': 4.8,
                'ranking': 'gold'
            },
            {
                'firstname': 'Paul', 
                'lastname': 'Smith', 
                'username': 'paul_smith',
                'email': 'paul.smith@example.com',
                'contact_number': '+639171234568',
                'bio': 'Silver Mechanic specializing in engine diagnostics',
                'city': 'Zamboanga City', 
                'province': 'Zamboanga del Sur',
                'rating': 4.5,
                'ranking': 'silver'
            },
            {
                'firstname': 'John', 
                'lastname': 'Davis', 
                'username': 'john_davis',
                'email': 'john.davis@example.com',
                'contact_number': '+639171234569',
                'bio': 'Experienced mechanic with expertise in transmission repair',
                'city': 'Manila', 
                'province': 'Metro Manila',
                'rating': 4.2,
                'ranking': 'bronze'
            },
            {
                'firstname': 'Carlos', 
                'lastname': 'Rodriguez', 
                'username': 'carlos_rodriguez',
                'email': 'carlos.rodriguez@example.com',
                'contact_number': '+639171234570',
                'bio': 'Standard mechanic providing quality automotive services',
                'city': 'Cebu City', 
                'province': 'Cebu',
                'rating': 3.9,
                'ranking': 'standard'
            }
        ]

        self.stdout.write('Creating sample mechanics...')
        
        for mechanic_data in mechanics_data:
            try:
                # Check if account already exists
                if Account.objects.filter(username=mechanic_data['username']).exists():
                    self.stdout.write(
                        self.style.WARNING(f"Mechanic {mechanic_data['username']} already exists. Skipping...")
                    )
                    continue

                # Create account
                account = Account.objects.create(
                    firstname=mechanic_data['firstname'],
                    lastname=mechanic_data['lastname'],
                    username=mechanic_data['username'],
                    email=mechanic_data['email'],
                    password=make_password('password123'),  # Default password
                    is_active=True,
                    is_verified=True
                )

                # Create account role
                AccountRole.objects.create(
                    acc=account,
                    account_role=AccountRole.ROLE_MECHANIC
                )

                # Create address
                AccountAddress.objects.create(
                    acc_add_id=account,
                    city_municipality=mechanic_data['city'],
                    province=mechanic_data['province'],
                    region='Sample Region'
                )

                # Create mechanic profile
                Mechanic.objects.create(
                    mechanic_id=account,
                    contact_number=mechanic_data['contact_number'],
                    bio=mechanic_data['bio'],
                    average_rating=Decimal(str(mechanic_data['rating'])),
                    ranking=mechanic_data['ranking'],
                    status='available'
                )

                self.stdout.write(
                    self.style.SUCCESS(f"Created mechanic: {mechanic_data['firstname']} {mechanic_data['lastname']}")
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creating mechanic {mechanic_data['username']}: {str(e)}")
                )

        self.stdout.write(self.style.SUCCESS('Sample mechanics created successfully!'))