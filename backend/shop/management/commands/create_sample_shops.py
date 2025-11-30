from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from accounts.models import Account, AccountRole, ShopOwner, AccountAddress
from shop.models import Shop, ShopMechanic
from accounts.models import Mechanic
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Create sample shop data for testing'

    def handle(self, *args, **options):
        # Sample shop data
        shops_data = [
            {
                'shop_name': 'Auto Expert Garage',
                'owner_firstname': 'Robert',
                'owner_lastname': 'Wilson',
                'owner_username': 'robert_wilson',
                'owner_email': 'robert.wilson@autoexpert.com',
                'contact_number': '+639171234571',
                'email': 'contact@autoexpert.com',
                'description': 'Full-service automotive repair shop with certified mechanics and quality service.',
                'city': 'Tetuan',
                'province': 'Zamboanga City'
            },
            {
                'shop_name': 'Precision Auto Works',
                'owner_firstname': 'Maria',
                'owner_lastname': 'Santos',
                'owner_username': 'maria_santos',
                'owner_email': 'maria.santos@precisionauto.com',
                'contact_number': '+639171234572',
                'email': 'info@precisionauto.com',
                'description': 'Precision automotive services specializing in brake systems and engine repair.',
                'city': 'Guiwan',
                'province': 'Zamboanga City'
            },
            {
                'shop_name': 'City Auto Service',
                'owner_firstname': 'James',
                'owner_lastname': 'Anderson',
                'owner_username': 'james_anderson',
                'owner_email': 'james.anderson@cityauto.com',
                'contact_number': '+639171234573',
                'email': 'service@cityauto.com',
                'description': 'Comprehensive vehicle maintenance and repair solutions for all car brands.',
                'city': 'Tumaga',
                'province': 'Zamboanga City'
            },
            {
                'shop_name': 'QuickFix Auto Center',
                'owner_firstname': 'Lisa',
                'owner_lastname': 'Garcia',
                'owner_username': 'lisa_garcia',
                'owner_email': 'lisa.garcia@quickfix.com',
                'contact_number': '+639171234574',
                'email': 'contact@quickfix.com',
                'description': 'Fast and reliable auto repair services with modern diagnostic equipment.',
                'city': 'Pasonanca',
                'province': 'Zamboanga City'
            },
            {
                'shop_name': 'Elite Motor Works',
                'owner_firstname': 'David',
                'owner_lastname': 'Kim',
                'owner_username': 'david_kim',
                'owner_email': 'david.kim@elitemotor.com',
                'contact_number': '+639171234575',
                'email': 'info@elitemotor.com',
                'description': 'Premium automotive services for luxury and high-performance vehicles.',
                'city': 'Calarian',
                'province': 'Zamboanga City'
            }
        ]

        self.stdout.write('Creating sample shops...')
        
        for shop_data in shops_data:
            try:
                # Check if shop already exists
                if Shop.objects.filter(shop_name=shop_data['shop_name']).exists():
                    self.stdout.write(
                        self.style.WARNING(f"Shop {shop_data['shop_name']} already exists. Skipping...")
                    )
                    continue

                # Check if shop owner account already exists
                if Account.objects.filter(username=shop_data['owner_username']).exists():
                    owner_account = Account.objects.get(username=shop_data['owner_username'])
                    self.stdout.write(
                        self.style.WARNING(f"Shop owner {shop_data['owner_username']} already exists. Using existing account...")
                    )
                else:
                    # Create shop owner account
                    owner_account = Account.objects.create(
                        firstname=shop_data['owner_firstname'],
                        lastname=shop_data['owner_lastname'],
                        username=shop_data['owner_username'],
                        email=shop_data['owner_email'],
                        password=make_password('password123'),  # Default password
                        is_active=True,
                        is_verified=True
                    )

                    # Create account role
                    AccountRole.objects.create(
                        acc=owner_account,
                        account_role=AccountRole.ROLE_SHOP_OWNER
                    )

                    # Create address
                    AccountAddress.objects.create(
                        acc_add_id=owner_account,
                        city_municipality=shop_data['city'],
                        province=shop_data['province'],
                        region='Zamboanga Peninsula'
                    )

                    # Create shop owner profile
                    shop_owner = ShopOwner.objects.create(
                        shop_owner_id=owner_account,
                        contact_number=shop_data['contact_number']
                    )

                # Get or create shop owner profile
                try:
                    shop_owner = ShopOwner.objects.get(shop_owner_id=owner_account)
                except ShopOwner.DoesNotExist:
                    shop_owner = ShopOwner.objects.create(
                        shop_owner_id=owner_account,
                        contact_number=shop_data['contact_number']
                    )

                # Create shop
                shop = Shop.objects.create(
                    shop_owner=shop_owner,
                    shop_name=shop_data['shop_name'],
                    contact_number=shop_data['contact_number'],
                    email=shop_data['email'],
                    description=shop_data['description'],
                    is_verified=True,
                    status='open'
                )

                # Add some mechanics to the shop (if any exist)
                mechanics = Mechanic.objects.all()[:2]  # Get up to 2 mechanics
                for mechanic in mechanics:
                    ShopMechanic.objects.get_or_create(
                        shop=shop,
                        mechanic=mechanic
                    )

                self.stdout.write(
                    self.style.SUCCESS(f"Created shop: {shop_data['shop_name']}")
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creating shop {shop_data['shop_name']}: {str(e)}")
                )

        self.stdout.write(self.style.SUCCESS('Sample shops created successfully!'))
