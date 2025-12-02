from django.contrib import admin
from .models import TokenPurchase, Payment, CommissionSettings, Transaction, Payout, TokenPackage


@admin.register(TokenPurchase)
class TokenPurchaseAdmin(admin.ModelAdmin):
    list_display = ['token_purchase_id', 'account', 'tokens_amount', 'price', 'status', 'purchased_at']
    list_filter = ['status', 'purchased_at']
    search_fields = ['account__username', 'account__email']
    readonly_fields = ['purchased_at']
    ordering = ['-purchased_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'request', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['request__request_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(CommissionSettings)
class CommissionSettingsAdmin(admin.ModelAdmin):
    list_display = ['settings_id', 'default_commission_rate', 'mechanic_bronze_rate', 
                    'mechanic_silver_rate', 'mechanic_gold_rate', 'shop_commission_rate', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('General Commission', {
            'fields': ('default_commission_rate',)
        }),
        ('Mechanic Tier Rates', {
            'fields': ('mechanic_bronze_rate', 'mechanic_silver_rate', 'mechanic_gold_rate')
        }),
        ('Shop Commission', {
            'fields': ('shop_commission_rate',)
        }),
        ('Metadata', {
            'fields': ('updated_by', 'updated_at', 'created_at')
        }),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'booking', 'provider', 'client', 'total_amount', 
                    'commission_amount', 'provider_payout', 'status', 'payout_status', 'transaction_date']
    list_filter = ['status', 'payout_status', 'transaction_date']
    search_fields = ['booking__booking_id', 'provider__username', 'client__username']
    readonly_fields = ['transaction_date', 'updated_at']
    ordering = ['-transaction_date']
    fieldsets = (
        ('Transaction Info', {
            'fields': ('booking', 'provider', 'client', 'status')
        }),
        ('Financial Details', {
            'fields': ('total_amount', 'commission_rate', 'commission_amount', 'provider_payout', 'payment_method')
        }),
        ('Payout Status', {
            'fields': ('payout_status', 'payout_date')
        }),
        ('Timestamps', {
            'fields': ('transaction_date', 'updated_at')
        }),
    )


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ['payout_id', 'recipient', 'amount', 'status', 'requested_at', 'processed_at']
    list_filter = ['status', 'requested_at', 'processed_at']
    search_fields = ['recipient__username', 'recipient__email', 'reference_number']
    readonly_fields = ['requested_at', 'updated_at']
    ordering = ['-requested_at']
    filter_horizontal = ['transactions']
    fieldsets = (
        ('Payout Info', {
            'fields': ('recipient', 'amount', 'status')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'reference_number')
        }),
        ('Transactions', {
            'fields': ('transactions',)
        }),
        ('Processing', {
            'fields': ('processed_by', 'notes', 'processed_at')
        }),
        ('Timestamps', {
            'fields': ('requested_at', 'updated_at')
        }),
    )


@admin.register(TokenPackage)
class TokenPackageAdmin(admin.ModelAdmin):
    list_display = ['package_id', 'name', 'tokens', 'price', 'discount_percentage', 'is_active', 'is_featured', 'created_at']
    list_filter = ['is_active', 'is_featured', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-is_featured', 'tokens']

