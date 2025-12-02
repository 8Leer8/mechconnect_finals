from django.contrib import admin
from .models import (
    Account, AccountAddress, AccountRole, AccountWarning, AccountBan,
    PasswordReset, ReportAccount, Client, Mechanic, ShopOwner,
    Admin, HeadAdmin, Notification, TokenPurchase, VerificationRejection
)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['acc_id', 'username', 'email', 'firstname', 'lastname', 'is_active', 'is_verified', 'created_at']
    list_filter = ['is_active', 'is_verified', 'gender', 'created_at']
    search_fields = ['username', 'email', 'firstname', 'lastname']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    ordering = ['-created_at']


@admin.register(AccountAddress)
class AccountAddressAdmin(admin.ModelAdmin):
    list_display = ['acc_add_id', 'city_municipality', 'province', 'region', 'postal_code']
    search_fields = ['city_municipality', 'province', 'barangay']


@admin.register(AccountRole)
class AccountRoleAdmin(admin.ModelAdmin):
    list_display = ['acc_rol_id', 'acc', 'account_role', 'appointed_at']
    list_filter = ['account_role', 'appointed_at']
    search_fields = ['acc__username', 'acc__email']
    ordering = ['-appointed_at']


@admin.register(AccountWarning)
class AccountWarningAdmin(admin.ModelAdmin):
    list_display = ['acc_war_id', 'receiver', 'issuer', 'created_at']
    list_filter = ['created_at']
    search_fields = ['receiver__username', 'issuer__username', 'reason_warning']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(AccountBan)
class AccountBanAdmin(admin.ModelAdmin):
    list_display = ['acc_ban_id', 'reason_ban', 'banned_at']
    search_fields = ['acc_ban_id__username', 'reason_ban']
    readonly_fields = ['banned_at', 'updated_at']
    ordering = ['-banned_at']


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ['reset_id', 'acc', 'status', 'requested_at', 'expires_at']
    list_filter = ['status', 'requested_at']
    search_fields = ['acc__username', 'acc__email', 'reset_token']
    readonly_fields = ['requested_at', 'used_at']
    ordering = ['-requested_at']


@admin.register(ReportAccount)
class ReportAccountAdmin(admin.ModelAdmin):
    list_display = ['rep_acc_id', 'reported', 'reporter', 'status', 'reported_at']
    list_filter = ['status', 'reported_at']
    search_fields = ['reported__username', 'reporter__username', 'reason']
    readonly_fields = ['reported_at', 'reviewed_at']
    ordering = ['-reported_at']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['client_id', 'contact_number', 'created_at']
    search_fields = ['client_id__username', 'client_id__email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Mechanic)
class MechanicAdmin(admin.ModelAdmin):
    list_display = ['mechanic_id', 'contact_number', 'ranking', 'average_rating', 'status', 'is_working_for_shop', 'shop', 'token_wallet']
    list_filter = ['ranking', 'status', 'is_working_for_shop', 'created_at']
    search_fields = ['mechanic_id__username', 'mechanic_id__email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-average_rating']


@admin.register(ShopOwner)
class ShopOwnerAdmin(admin.ModelAdmin):
    list_display = ['shop_owner_id', 'contact_number', 'owns_shop', 'shop', 'status', 'token_wallet']
    list_filter = ['owns_shop', 'status', 'created_at']
    search_fields = ['shop_owner_id__username', 'shop_owner_id__email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Admin)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['admin_id', 'contact_number', 'created_by_admin', 'created_at']
    search_fields = ['admin_id__username', 'admin_id__email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(HeadAdmin)
class HeadAdminAdmin(admin.ModelAdmin):
    list_display = ['head_admin_id', 'contact_number', 'created_at']
    search_fields = ['head_admin_id__username', 'head_admin_id__email', 'contact_number']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['notification_id', 'receiver', 'title', 'type', 'is_read', 'created_at']
    list_filter = ['type', 'is_read', 'created_at']
    search_fields = ['receiver__username', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(TokenPurchase)
class TokenPurchaseAdmin(admin.ModelAdmin):
    list_display = ['token_purchase_id', 'account', 'tokens_amount', 'price', 'status', 'purchased_at']
    list_filter = ['status', 'purchased_at']
    search_fields = ['account__username', 'account__email']
    readonly_fields = ['purchased_at']
    ordering = ['-purchased_at']


@admin.register(VerificationRejection)
class VerificationRejectionAdmin(admin.ModelAdmin):
    list_display = ['rejection_id', 'account', 'rejected_by', 'rejected_at']
    search_fields = ['account__username', 'rejected_by__username', 'reason']
    readonly_fields = ['rejected_at']
    ordering = ['-rejected_at']
