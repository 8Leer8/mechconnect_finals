from django.db import models

class TokenPurchase(models.Model):
    token_purchase_id = models.AutoField(primary_key=True)
    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='payment_token_purchases'  
    )
    tokens_amount = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, null=True, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)


class Payment(models.Model):
    payment_id = models.AutoField(primary_key=True)
    request = models.ForeignKey('requests.Request', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)


class CommissionSettings(models.Model):
    """
    Global commission settings for the platform
    """
    settings_id = models.AutoField(primary_key=True)
    default_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    mechanic_bronze_rate = models.DecimalField(max_digits=5, decimal_places=2, default=12.00)
    mechanic_silver_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    mechanic_gold_rate = models.DecimalField(max_digits=5, decimal_places=2, default=8.00)
    shop_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20.00)
    updated_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='commission_updates')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Commission Settings"
        verbose_name_plural = "Commission Settings"

    def __str__(self):
        return f"Commission Settings (Default: {self.default_commission_rate}%)"


class Transaction(models.Model):
    """
    Financial transaction record for each booking
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('refunded', 'Refunded'),
        ('processing', 'Processing'),
    ]

    transaction_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='transactions')
    provider = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, related_name='transactions_received')
    client = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, related_name='transactions_made')
    
    # Amount details
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    provider_payout = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment details
    payment_method = models.CharField(max_length=100, default='Online Payment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Payout tracking
    payout_status = models.CharField(max_length=20, default='pending')  # pending, paid
    payout_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    transaction_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-transaction_date']

    def __str__(self):
        return f"Transaction #{self.transaction_id} - ₱{self.total_amount}"

    def save(self, *args, **kwargs):
        # Auto-calculate commission and payout if not set
        if not self.commission_amount and self.total_amount:
            self.commission_amount = (self.total_amount * self.commission_rate) / 100
            self.provider_payout = self.total_amount - self.commission_amount
        super().save(*args, **kwargs)


class Payout(models.Model):
    """
    Payout records to mechanics/shop owners
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    payout_id = models.AutoField(primary_key=True)
    recipient = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transactions = models.ManyToManyField('payment.Transaction', related_name='payouts')
    
    # Payment details
    payment_method = models.CharField(max_length=100, null=True, blank=True)
    reference_number = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Processing
    processed_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='payouts_processed')
    notes = models.TextField(null=True, blank=True)
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"Payout #{self.payout_id} to {self.recipient.username} - ₱{self.amount}"


class TokenPackage(models.Model):
    """
    Token packages for purchase
    """
    package_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    tokens = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'tokens']

    def __str__(self):
        return f"{self.name} - {self.tokens} tokens for ₱{self.price}"


class BookingPayment(models.Model):
    """
    Payment records for bookings - tracks client payments
    """
    PAYMENT_TYPE_CHOICES = [
        ('full', 'Full Payment'),
        ('advance', 'Advance Payment'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('advance_paid', 'Advance Paid'),
        ('fully_paid', 'Fully Paid'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('gcash', 'GCash'),
        ('paymaya', 'PayMaya'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash on Service'),
        ('other', 'Other'),
    ]

    payment_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='booking_payments')
    
    # Payment details
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='full')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='gcash')
    
    # Amount tracking
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Payment proof
    payment_proof = models.TextField(null=True, blank=True)  # Base64 image or URL
    reference_number = models.CharField(max_length=255, null=True, blank=True)
    
    # Metadata
    paid_by = models.ForeignKey('accounts.Account', on_delete=models.SET_NULL, null=True, related_name='payments_made')
    payment_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment for Booking #{self.booking.booking_id} - {self.payment_status}"

    def save(self, *args, **kwargs):
        # Auto-calculate remaining balance
        self.remaining_balance = self.total_amount - self.amount_paid
        
        # Update payment status based on amounts
        if self.amount_paid == 0:
            self.payment_status = 'unpaid'
        elif self.amount_paid >= self.total_amount:
            self.payment_status = 'fully_paid'
            self.remaining_balance = 0
        else:
            self.payment_status = 'advance_paid'
            
        super().save(*args, **kwargs)

