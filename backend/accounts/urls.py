from django.urls import path
from .views import (
    authentication, dashboard, users, verifications, shops, 
    tokens, disputes, reports, financial, account_management
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('register/', authentication.register, name='register'),
    path('login/', authentication.login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', authentication.profile, name='profile'),
    path('profile/update/', authentication.update_profile, name='update_profile'),
    
    # Password management
    path('password/change/', authentication.change_password, name='change_password'),
    path('password/reset/request/', authentication.password_reset_request, name='password_reset_request'),
    path('password/reset/confirm/', authentication.password_reset_confirm, name='password_reset_confirm'),
    
    # Role management
    path('check-roles/', authentication.check_user_roles, name='check_user_roles'),
    
    # Health check
    path('health/', dashboard.health_check, name='health_check'),

    # Discovery endpoints
    path('discover/mechanics/', users.discover_mechanics, name='discover_mechanics'),
    
    # Mechanic detail endpoint
    path('mechanic/<int:mechanic_id>/', users.mechanic_detail, name='mechanic_detail'),
    
    # Client address endpoint
    path('client/<int:client_id>/address/', users.get_client_address, name='get_client_address'),

    # Head Admin Dashboard
    path('head-admin/dashboard/stats/', dashboard.head_admin_dashboard_stats, name='head_admin_dashboard_stats'),
    
    # Head Admin User Management
    path('head-admin/users/', users.get_all_users, name='get_all_users'),
    path('head-admin/ban-user/', users.ban_user, name='ban_user'),
    path('head-admin/unban-user/', users.unban_user, name='unban_user'),

    # Head Admin Verification Management
    path('head-admin/verifications/', verifications.get_verifications, name='get_verifications'),
    path('head-admin/verify-user/', verifications.verify_user_verification, name='verify_user_verification'),
    path('head-admin/reject-verification/', verifications.reject_verification, name='reject_verification'),
    
    # Head Admin Shop Management
    path('head-admin/shops/', shops.get_shops, name='get_shops'),
    path('head-admin/verify-shop/', shops.verify_shop, name='verify_shop'),
    path('head-admin/deactivate-shop/', shops.deactivate_shop, name='deactivate_shop'),
    path('head-admin/activate-shop/', shops.activate_shop, name='activate_shop'),

    # Head Admin Token Management
    path('head-admin/token-purchases/', tokens.get_token_purchases, name='get_token_purchases'),
    
    # Head Admin Dispute Management
    path('head-admin/disputes/', disputes.get_disputes, name='get_disputes'),
    path('head-admin/resolve-dispute/', disputes.resolve_dispute, name='resolve_dispute'),
    
    # Head Admin Report Management
    path('head-admin/reports/', reports.get_reports, name='get_reports'),
    path('head-admin/review-report/', reports.review_report, name='review_report'),
    path('head-admin/dismiss-report/', reports.dismiss_report, name='dismiss_report'),
    
    # Head Admin Financial Management
    path('head-admin/financial/stats/', financial.get_financial_stats, name='get_financial_stats'),
    path('head-admin/financial/transactions/', financial.get_financial_transactions, name='get_financial_transactions'),
    path('head-admin/commission/settings/', financial.commission_settings, name='commission_settings'),

    # Head Admin Account Management
    path('head-admin/admin-accounts/', account_management.manage_admin_accounts, name='manage_admin_accounts'),
    path('head-admin/admin-accounts/<int:admin_id>/', account_management.manage_admin_accounts, name='manage_admin_accounts_detail'),
    path('head-admin/admin-accounts/<int:admin_id>/toggle-active/', account_management.toggle_admin_active, name='toggle_admin_active'),
    
    # Head Admin Token Pricing
    path('head-admin/token-pricing/', tokens.manage_token_pricing, name='manage_token_pricing'),
    path('head-admin/token-pricing/<int:package_id>/', tokens.manage_token_pricing, name='manage_token_pricing_detail'),
]

