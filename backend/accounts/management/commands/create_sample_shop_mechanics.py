from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from decimal import Decimal
from accounts.models import Account, AccountRole, Mechanic, ShopOwner
from shop.models import Shop
from services.models import Service, ServiceCategory, ShopService, ShopServiceMechanic
from specialties.models import Specialty, MechanicSpecialty


class Command(BaseCommand):
    help = 'Create sample shop mechanics with assigned services'

    def handle(self, *args, **options):
        try:
            # First, check if we have a shop to assign mechanics to
            shop = None
            try:
                shop = Shop.objects.first()
                if not shop:
                    self.stdout.write(self.style.WARNING('No shop found. Creating a sample shop first...'))
                    
                    # Create shop owner account
                    shop_owner_account = Account.objects.create(
                        firstname="Jane",
                        lastname="Smith",
                        middlename="M",
                        email="jane.smith@shop.com",
                        username="janesmith_shop",
                        password=make_password("password123"),
                        is_active=True,
                        is_verified=True
                    )
                    
                    # Create shop owner role
                    AccountRole.objects.create(
                        acc=shop_owner_account,
                        account_role=AccountRole.ROLE_SHOP_OWNER
                    )
                    
                    # Create shop owner profile
                    shop_owner_profile = ShopOwner.objects.create(
                        shop_owner_id=shop_owner_account,
                        contact_number="+1234567891",
                        bio="Professional automotive shop owner",
                        owns_shop=True,
                        status='active'
                    )
                    
                    # Create the shop
                    shop = Shop.objects.create(
                        shop_name="AutoCare Pro Shop",
                        shop_owner=shop_owner_profile,
                        contact_number="+1234567891",
                        email="info@autocareproshop.com",
                        description="Professional automotive repair and maintenance services with certified mechanics",
                        service_banner="https://example.com/shop-banner.jpg",
                        is_verified=True,
                        status='active'
                    )
                    
                    # Update shop owner profile with the shop
                    shop_owner_profile.shop = shop
                    shop_owner_profile.save()
                    
                    self.stdout.write(self.style.SUCCESS(f'Created sample shop: {shop.shop_name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating/finding shop: {str(e)}'))
                return
            
            # Create service categories if they don't exist
            categories_data = [
                {'name': 'Engine Repair', 'worth_token': Decimal('100.00')},
                {'name': 'Brake Service', 'worth_token': Decimal('80.00')},
                {'name': 'Oil Change', 'worth_token': Decimal('50.00')},
                {'name': 'Tire Service', 'worth_token': Decimal('60.00')},
                {'name': 'AC Service', 'worth_token': Decimal('90.00')},
            ]
            
            for cat_data in categories_data:
                category, created = ServiceCategory.objects.get_or_create(
                    name=cat_data['name'],
                    defaults={'worth_token': cat_data['worth_token']}
                )
                if created:
                    self.stdout.write(f'Created service category: {category.name}')
            
            # Create shop services
            services_data = [
                {
                    'name': 'Complete Engine Overhaul',
                    'description': 'Full engine rebuild and restoration service',
                    'category': 'Engine Repair',
                    'price': Decimal('2500.00')
                },
                {
                    'name': 'Brake Pad Replacement',
                    'description': 'Replace brake pads and inspect brake system',
                    'category': 'Brake Service', 
                    'price': Decimal('800.00')
                },
                {
                    'name': 'Premium Oil Change',
                    'description': 'Full synthetic oil change with filter replacement',
                    'category': 'Oil Change',
                    'price': Decimal('450.00')
                },
                {
                    'name': 'Tire Installation & Balancing',
                    'description': 'New tire installation with wheel balancing',
                    'category': 'Tire Service',
                    'price': Decimal('600.00')
                },
                {
                    'name': 'AC System Repair',
                    'description': 'Complete AC system diagnosis and repair',
                    'category': 'AC Service',
                    'price': Decimal('1200.00')
                },
            ]
            
            created_services = []
            for service_data in services_data:
                category = ServiceCategory.objects.get(name=service_data['category'])
                
                service, created = Service.objects.get_or_create(
                    name=service_data['name'],
                    defaults={
                        'description': service_data['description'],
                        'service_category': category,
                        'price': service_data['price']
                    }
                )
                
                if created:
                    self.stdout.write(f'Created service: {service.name}')
                    
                # Create shop service if it doesn't exist
                shop_service, created = ShopService.objects.get_or_create(
                    service=service,
                    shop=shop
                )
                if created:
                    self.stdout.write(f'Added service to shop: {service.name}')
                    
                created_services.append(shop_service)
            
            # Create specialties if they don't exist
            specialties_data = ['Engine Repair', 'Brake System', 'Electrical', 'Transmission', 'AC Repair', 'Tire Service']
            
            for specialty_name in specialties_data:
                specialty, created = Specialty.objects.get_or_create(name=specialty_name)
                if created:
                    self.stdout.write(f'Created specialty: {specialty.name}')
            
            # Create sample shop mechanics
            mechanics_data = [
                {
                    'firstname': 'Carlos',
                    'lastname': 'Rodriguez', 
                    'middlename': 'J',
                    'email': 'carlos.rodriguez@shop.com',
                    'username': 'carlos_mechanic',
                    'bio': 'Expert engine specialist with 15+ years experience in automotive repair',
                    'ranking': 'gold',
                    'specialties': ['Engine Repair', 'Transmission']
                },
                {
                    'firstname': 'David',
                    'lastname': 'Wilson',
                    'middlename': 'L',
                    'email': 'david.wilson@shop.com', 
                    'username': 'david_mechanic',
                    'bio': 'Certified brake and suspension specialist',
                    'ranking': 'silver',
                    'specialties': ['Brake System', 'Tire Service']
                },
                {
                    'firstname': 'Robert',
                    'lastname': 'Brown',
                    'middlename': 'K',
                    'email': 'robert.brown@shop.com',
                    'username': 'robert_mechanic', 
                    'bio': 'AC and electrical systems expert',
                    'ranking': 'bronze',
                    'specialties': ['AC Repair', 'Electrical']
                }
            ]
            
            created_mechanics = []
            existing_mechanics = []
            
            for mechanic_data in mechanics_data:
                # Check if mechanic already exists by email or username
                existing_account = None
                if Account.objects.filter(email=mechanic_data['email']).exists():
                    existing_account = Account.objects.get(email=mechanic_data['email'])
                    self.stdout.write(f'Mechanic with email {mechanic_data["email"]} already exists, using existing...')
                elif Account.objects.filter(username=mechanic_data['username']).exists():
                    existing_account = Account.objects.get(username=mechanic_data['username'])
                    self.stdout.write(f'Mechanic with username {mechanic_data["username"]} already exists, using existing...')
                
                if existing_account:
                    if hasattr(existing_account, 'mechanic_profile'):
                        existing_mechanics.append(existing_account.mechanic_profile)
                    continue
                
                # Create mechanic account
                mechanic_account = Account.objects.create(
                    firstname=mechanic_data['firstname'],
                    lastname=mechanic_data['lastname'],
                    middlename=mechanic_data['middlename'],
                    email=mechanic_data['email'],
                    username=mechanic_data['username'],
                    password=make_password("password123"),
                    is_active=True,
                    is_verified=True
                )
                
                # Create mechanic role
                AccountRole.objects.create(
                    acc=mechanic_account,
                    account_role=AccountRole.ROLE_MECHANIC
                )
                
                # Create mechanic profile
                mechanic_profile = Mechanic.objects.create(
                    mechanic_id=mechanic_account,
                    bio=mechanic_data['bio'],
                    average_rating=Decimal('4.5'),
                    ranking=mechanic_data['ranking'],
                    contact_number=f"+123456789{len(created_mechanics) + 2}",
                    is_working_for_shop=True,
                    shop=shop,
                    status='available'
                )
                
                # Add specialties using the intermediate model
                for specialty_name in mechanic_data['specialties']:
                    specialty = Specialty.objects.get(name=specialty_name)
                    MechanicSpecialty.objects.get_or_create(
                        mechanic=mechanic_profile,
                        specialty=specialty
                    )
                
                created_mechanics.append(mechanic_profile)
                self.stdout.write(f'Created shop mechanic: {mechanic_account.firstname} {mechanic_account.lastname}')
            
            # Combine created and existing mechanics
            all_mechanics = created_mechanics + existing_mechanics
            
            # Assign services to mechanics (only if we have mechanics and services)
            if all_mechanics and created_services:
                service_assignments = [
                    (0, [0, 1]),  # First mechanic gets Engine Overhaul and Brake Pad Replacement
                    (1, [1, 3]),  # Second mechanic gets Brake Pad Replacement and Tire Installation
                    (2, [2, 4]),  # Third mechanic gets Oil Change and AC System Repair
                ]
                
                for mechanic_index, service_indices in service_assignments:
                    if mechanic_index < len(all_mechanics):
                        mechanic = all_mechanics[mechanic_index]
                        for service_index in service_indices:
                            if service_index < len(created_services):
                                shop_service = created_services[service_index]
                                
                                assignment, created = ShopServiceMechanic.objects.get_or_create(
                                    shop_service=shop_service,
                                    mechanic=mechanic
                                )
                                
                                if created:
                                    self.stdout.write(
                                        f'Assigned {shop_service.service.name} to {mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname}'
                                    )
                                else:
                                    self.stdout.write(
                                        f'Service {shop_service.service.name} already assigned to {mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname}'
                                    )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully processed {len(created_mechanics)} new mechanics and {len(existing_mechanics)} existing mechanics!'
                )
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Shop: {shop.shop_name} (ID: {shop.shop_id})'
                )
            )
            
            if created_mechanics:
                self.stdout.write(self.style.SUCCESS('New mechanics created:'))
                for mechanic in created_mechanics:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  - {mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname} (ID: {mechanic.mechanic_id.acc_id})'
                        )
                    )
            
            if existing_mechanics:
                self.stdout.write(self.style.SUCCESS('Existing mechanics found:'))
                for mechanic in existing_mechanics:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  - {mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname} (ID: {mechanic.mechanic_id.acc_id})'
                        )
                    )
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating sample data: {str(e)}'))