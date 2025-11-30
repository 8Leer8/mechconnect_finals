from django.core.management.base import BaseCommand
from services.models import Service, ServiceCategory, MechanicService, ShopService
from accounts.models import Mechanic
from shop.models import Shop
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Create sample service data for testing'

    def handle(self, *args, **options):
        # Create service categories first
        categories_data = [
            {'name': 'Repair', 'worth_token': Decimal('100.00')},
            {'name': 'Maintenance', 'worth_token': Decimal('50.00')},
            {'name': 'Diagnostics', 'worth_token': Decimal('75.00')},
            {'name': 'Installation', 'worth_token': Decimal('80.00')},
            {'name': 'Emergency', 'worth_token': Decimal('150.00')}
        ]

        self.stdout.write('Creating service categories...')
        
        for cat_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'worth_token': cat_data['worth_token']}
            )
            if created:
                self.stdout.write(f"Created category: {category.name}")

        # Sample services data
        services_data = [
            {
                'name': 'Car Engine Repair',
                'description': 'Professional engine repair service including diagnostics, troubleshooting, and repair of engine components.',
                'price': Decimal('1200.00'),
                'category': 'Repair',
                'provider_type': 'mechanic'  # or 'shop'
            },
            {
                'name': 'Brake System Service',
                'description': 'Complete brake system maintenance including brake pad replacement, brake fluid change, and brake inspection.',
                'price': Decimal('850.00'),
                'category': 'Maintenance',
                'provider_type': 'shop'
            },
            {
                'name': 'Oil Change Service',
                'description': 'Quick and professional oil change service with high-quality motor oil and filter replacement.',
                'price': Decimal('450.00'),
                'category': 'Maintenance',
                'provider_type': 'mechanic'
            },
            {
                'name': 'Transmission Repair',
                'description': 'Expert transmission repair and maintenance services for automatic and manual transmissions.',
                'price': Decimal('2500.00'),
                'category': 'Repair',
                'provider_type': 'shop'
            },
            {
                'name': 'Battery Replacement',
                'description': 'Car battery testing, replacement, and installation with warranty coverage.',
                'price': Decimal('650.00'),
                'category': 'Installation',
                'provider_type': 'mechanic'
            },
            {
                'name': 'AC System Repair',
                'description': 'Air conditioning system diagnostics, repair, and maintenance for optimal cooling performance.',
                'price': Decimal('950.00'),
                'category': 'Repair',
                'provider_type': 'shop'
            },
            {
                'name': 'Tire Installation',
                'description': 'Professional tire installation, balancing, and alignment services.',
                'price': Decimal('300.00'),
                'category': 'Installation',
                'provider_type': 'mechanic'
            },
            {
                'name': 'Engine Diagnostics',
                'description': 'Comprehensive engine diagnostics using advanced computer diagnostic tools.',
                'price': Decimal('500.00'),
                'category': 'Diagnostics',
                'provider_type': 'shop'
            }
        ]

        self.stdout.write('Creating sample services...')
        
        # Get available mechanics and shops
        mechanics = list(Mechanic.objects.all())
        shops = list(Shop.objects.all())
        
        if not mechanics and not shops:
            self.stdout.write(
                self.style.WARNING('No mechanics or shops found. Please create sample mechanics and shops first.')
            )
            return

        for service_data in services_data:
            try:
                # Check if service already exists
                if Service.objects.filter(name=service_data['name']).exists():
                    self.stdout.write(
                        self.style.WARNING(f"Service {service_data['name']} already exists. Skipping...")
                    )
                    continue

                # Get service category
                try:
                    category = ServiceCategory.objects.get(name=service_data['category'])
                except ServiceCategory.DoesNotExist:
                    category = ServiceCategory.objects.first()

                # Create service
                service = Service.objects.create(
                    name=service_data['name'],
                    description=service_data['description'],
                    price=service_data['price'],
                    service_category=category
                )

                # Assign service to provider
                if service_data['provider_type'] == 'mechanic' and mechanics:
                    # Assign to a random mechanic
                    mechanic = random.choice(mechanics)
                    MechanicService.objects.create(
                        service=service,
                        mechanic=mechanic
                    )
                    provider_name = f"{mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname}"
                elif service_data['provider_type'] == 'shop' and shops:
                    # Assign to a random shop
                    shop = random.choice(shops)
                    ShopService.objects.create(
                        service=service,
                        shop=shop
                    )
                    provider_name = shop.shop_name
                else:
                    # Fallback - assign to first available provider
                    if mechanics:
                        mechanic = mechanics[0]
                        MechanicService.objects.create(
                            service=service,
                            mechanic=mechanic
                        )
                        provider_name = f"{mechanic.mechanic_id.firstname} {mechanic.mechanic_id.lastname}"
                    elif shops:
                        shop = shops[0]
                        ShopService.objects.create(
                            service=service,
                            shop=shop
                        )
                        provider_name = shop.shop_name
                    else:
                        provider_name = "No provider"

                self.stdout.write(
                    self.style.SUCCESS(f"Created service: {service_data['name']} (Provider: {provider_name})")
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creating service {service_data['name']}: {str(e)}")
                )

        self.stdout.write(self.style.SUCCESS('Sample services created successfully!'))
