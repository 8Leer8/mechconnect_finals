from django.core.management.base import BaseCommand
from django.db import transaction
from bookings.models import Booking, ClientBookingList, ActiveBooking, CompletedBooking
from accounts.models import Account, Client
from requests.models import Request
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Check and manage bookings for client ID 10'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create',
            action='store_true',
            help='Create sample booking for client ID 10',
        )
        parser.add_argument(
            '--create-samples',
            action='store_true',
            help='Create multiple sample bookings with different statuses for client ID 10',
        )
        parser.add_argument(
            '--status',
            type=str,
            choices=['active', 'completed', 'cancelled', 'rescheduled', 'dispute', 'refunded', 'back_jobs'],
            help='Filter bookings by status',
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all bookings for client ID 10',
        )

    def handle(self, *args, **options):
        try:
            # Get client with ID 10 (client_id is a OneToOneField to Account)
            client = Client.objects.select_related('client_id').get(client_id__acc_id=10)
            account = client.client_id  # client_id is the Account instance
            
            self.stdout.write(
                self.style.SUCCESS(f'Found client: {account.firstname} {account.lastname} (Account ID: {account.acc_id})')
            )
            
            if options['create']:
                self.create_sample_booking(client)
            elif options['create_samples']:
                self.create_sample_bookings(client)
            elif options['list']:
                self.list_bookings(client, options.get('status'))
            else:
                self.check_bookings(client, options.get('status'))
                
        except Client.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Client with account ID 10 not found!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {str(e)}')
            )

    def check_bookings(self, client, status_filter=None):
        """Check existing bookings for the client"""
        self.stdout.write(f'\n=== CHECKING BOOKINGS FOR CLIENT (Account ID: {client.client_id.acc_id}) ===\n')
        
        # Get bookings through ClientBookingList
        client_booking_lists = ClientBookingList.objects.filter(client=client).select_related('booking', 'booking__request')
        
        if status_filter:
            client_booking_lists = client_booking_lists.filter(booking__status=status_filter)
        
        if not client_booking_lists.exists():
            self.stdout.write(self.style.WARNING('No bookings found for this client.'))
            return
            
        self.stdout.write(f'Found {client_booking_lists.count()} booking(s):\n')
        
        for client_booking in client_booking_lists:
            booking = client_booking.booking
            request = booking.request
            
            self.stdout.write(f'📋 Booking ID: {booking.booking_id}')
            self.stdout.write(f'   Status: {booking.status}')
            self.stdout.write(f'   Amount: ₱{booking.amount_fee}')
            self.stdout.write(f'   Request ID: {request.request_id}')
            self.stdout.write(f'   Service Type: {request.service_type}')
            self.stdout.write(f'   Booked At: {booking.booked_at}')
            
            # Check for additional booking details
            if hasattr(booking, 'active_booking'):
                active = booking.active_booking
                self.stdout.write(f'   📍 Active Status: {active.status}')
                if active.started_at:
                    self.stdout.write(f'   Started At: {active.started_at}')
                    
            if hasattr(booking, 'completed_booking'):
                completed = booking.completed_booking
                self.stdout.write(f'   ✅ Completed At: {completed.completed_at}')
                self.stdout.write(f'   Total Amount: ₱{completed.total_amount}')
                
            self.stdout.write('   ' + '-' * 50)

    def list_bookings(self, client, status_filter=None):
        """List bookings in a simple format"""
        client_booking_lists = ClientBookingList.objects.filter(client=client).select_related('booking', 'booking__request')
        
        if status_filter:
            client_booking_lists = client_booking_lists.filter(booking__status=status_filter)
            
        if not client_booking_lists.exists():
            self.stdout.write('No bookings found.')
            return
            
        self.stdout.write(f'Bookings for Client (Account ID: {client.client_id.acc_id}):')
        for client_booking in client_booking_lists:
            booking = client_booking.booking
            self.stdout.write(f'  - Booking {booking.booking_id}: {booking.status} (₱{booking.amount_fee})')

    @transaction.atomic
    def create_sample_booking(self, client):
        """Create a sample booking for testing"""
        try:
            # Try to find an existing request for this client
            from bookings.models import ClientRequestList
            
            client_requests = ClientRequestList.objects.filter(client=client).select_related('request')
            
            if not client_requests.exists():
                self.stdout.write(self.style.WARNING('No requests found for this client. Creating a sample request first...'))
                
                # Create a sample request
                request = Request.objects.create(
                    client=client,
                    request_type='custom',
                    request_status='accepted'
                )
                
                # Link request to client
                ClientRequestList.objects.create(client=client, request=request)
                self.stdout.write(self.style.SUCCESS(f'Created sample request ID: {request.request_id}'))
            else:
                # Use the first available request
                request = client_requests.first().request
                self.stdout.write(f'Using existing request ID: {request.request_id}')
            
            # Create booking
            booking = Booking.objects.create(
                request=request,
                status='active',
                amount_fee=random.uniform(100, 500)
            )
            
            # Add to client booking list
            ClientBookingList.objects.create(client=client, booking=booking)
            
            # Create active booking record
            ActiveBooking.objects.create(
                booking=booking,
                status='in_progress',
                started_at=datetime.now()
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully created booking ID: {booking.booking_id} for client (Account ID: {client.client_id.acc_id})')
            )
            self.stdout.write(f'   Amount: ₱{booking.amount_fee}')
            self.stdout.write(f'   Status: {booking.status}')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create booking: {str(e)}')
            )

    @transaction.atomic
    def create_sample_bookings(self, client):
        """Create multiple sample bookings with different statuses"""
        statuses_to_create = ['active', 'completed', 'rescheduled', 'cancelled']
        
        for status in statuses_to_create:
            try:
                # Get or create a request
                from bookings.models import ClientRequestList
                
                client_requests = ClientRequestList.objects.filter(client=client).select_related('request')
                
                if client_requests.exists():
                    request = client_requests.first().request
                else:
                    # Create a sample request
                    request = Request.objects.create(
                        client=client,
                        request_type='custom',
                        request_status='accepted'
                    )
                    ClientRequestList.objects.create(client=client, request=request)
                
                # Create booking with different status
                booking = Booking.objects.create(
                    request=request,
                    status=status,
                    amount_fee=random.uniform(100, 800)
                )
                
                # Add to client booking list
                ClientBookingList.objects.create(client=client, booking=booking)
                
                # Create related booking records based on status
                if status == 'active':
                    ActiveBooking.objects.create(
                        booking=booking,
                        status='in_progress',
                        started_at=datetime.now() - timedelta(hours=random.randint(1, 12))
                    )
                elif status == 'completed':
                    CompletedBooking.objects.create(
                        booking=booking,
                        completed_at=datetime.now() - timedelta(days=random.randint(1, 7)),
                        total_amount=booking.amount_fee
                    )
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created {status} booking ID: {booking.booking_id} (₱{booking.amount_fee})')
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create {status} booking: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Sample bookings created for client (Account ID: {client.client_id.acc_id})')
        )