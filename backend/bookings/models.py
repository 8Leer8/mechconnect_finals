from django.db import models

class Booking(models.Model):
    STATUS_CHOICES = [
        ('active','active'),
        ('completed','completed'),
        ('refunded','refunded'),
        ('back_jobs','back_jobs'),
        ('cancelled','cancelled'),
        ('rescheduled','rescheduled'),
        ('dispute','dispute'),
    ]

    booking_id = models.AutoField(primary_key=True)
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active')
    amount_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)


class ActiveBooking(models.Model):
    active_booking_id = models.AutoField(primary_key=True)
    booking = models.OneToOneField('booking.Booking', on_delete=models.CASCADE, related_name='active_booking')
    status = models.CharField(max_length=50, null=True, blank=True)
    before_picture_service = models.CharField(max_length=1024, null=True, blank=True)
    after_picture_service = models.CharField(max_length=1024, null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class RescheduledBooking(models.Model):
    rescheduled_booking_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, related_name='reschedules')
    reason = models.CharField(max_length=1024, null=True, blank=True)
    requested_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='reschedule_requests')
    requested_by_role = models.CharField(max_length=20, null=True, blank=True)  # enum: client, mechanic, shop
    status = models.CharField(max_length=20, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class CancelledBooking(models.Model):
    cancelled_booking_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, related_name='cancellations')
    reason = models.TextField(null=True, blank=True)
    cancelled_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='cancellations_made')
    cancelled_by_role = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    cancelled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class BackJobsBooking(models.Model):
    back_jobs_booking_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, related_name='back_jobs')
    requested_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='back_jobs_requests')
    reason = models.TextField(null=True, blank=True)
    STATUS_CHOICES = [('pending','pending'),('approved','approved'),('rejected','rejected'),('completed','completed')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)


class Dispute(models.Model):
    dispute_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, related_name='disputes')
    complainer = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='disputes_made')
    complainer_role = models.CharField(max_length=20, null=True, blank=True)
    complaint_against = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='disputes_received')
    complaint_against_role = models.CharField(max_length=20, null=True, blank=True)
    admin = models.ForeignKey('accounts.Admin', on_delete=models.SET_NULL, null=True, blank=True, related_name='handled_disputes')
    issue_description = models.TextField(null=True, blank=True)
    issue_picture = models.CharField(max_length=1024, null=True, blank=True)
    resolution_notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)


class RefundedBooking(models.Model):
    refunded_booking_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, related_name='refunds')
    requested_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='refund_requests')
    requested_by_role = models.CharField(max_length=20, null=True, blank=True)
    admin = models.ForeignKey('accounts.Admin', on_delete=models.SET_NULL, null=True, blank=True, related_name='refunds_processed')
    reason = models.TextField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class StatusRequest(models.Model):
    status_request_id = models.AutoField(primary_key=True)
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='status_requests')
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)


class ClientRequestList(models.Model):
    client_request_list_id = models.AutoField(primary_key=True)
    client = models.ForeignKey('accounts.Client', on_delete=models.CASCADE, related_name='request_list')
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='in_client_lists')


class ClientBookingList(models.Model):
    client_booking_list_id = models.AutoField(primary_key=True)
    client = models.ForeignKey('accounts.Client', on_delete=models.CASCADE, related_name='booking_list')
    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, related_name='in_client_lists')


class CompletedBooking(models.Model):
    completed_booking_id = models.AutoField(primary_key=True)
    booking = models.OneToOneField('booking.Booking', on_delete=models.CASCADE, related_name='completed_booking')
    completed_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(null=True, blank=True)
