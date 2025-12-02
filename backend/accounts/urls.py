from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    
    # Password management
    path('password/change/', views.change_password, name='change_password'),
    path('password/reset/request/', views.password_reset_request, name='password_reset_request'),
    path('password/reset/confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # User management (admin functionality)
    path('users/', views.get_users, name='get_users'),
    path('users/<int:user_id>/', views.get_user_by_id, name='get_user_by_id'),
    path('users/<int:user_id>/deactivate/', views.deactivate_user, name='deactivate_user'),
    path('users/<int:user_id>/activate/', views.activate_user, name='activate_user'),
    path('users/<int:user_id>/verify/', views.verify_user, name='verify_user'),
    
    # Notifications
    path('notifications/', views.user_notifications, name='user_notifications'),
    path('notifications/<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    
    # Discovery
    path('discover/mechanics/', views.discover_mechanics, name='discover_mechanics'),
    path('mechanic/<int:mechanic_id>/', views.mechanic_detail, name='mechanic_detail'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),

    # Head Admin Dashboard
    path('head-admin/dashboard/stats/', views.head_admin_dashboard_stats, name='head_admin_dashboard_stats'),
    
    # Head Admin User Management
    path('head-admin/users/', views.get_all_users, name='get_all_users'),
    path('head-admin/ban-user/', views.ban_user, name='ban_user'),
    path('head-admin/unban-user/', views.unban_user, name='unban_user'),

    # Head Admin Verification Management
    path('head-admin/verifications/', views.get_verifications, name='get_verifications'),
    path('head-admin/verify-user/', views.verify_user_verification, name='verify_user_verification'),
    path('head-admin/reject-verification/', views.reject_verification, name='reject_verification'),
    
    # Head Admin Shop Management
    path('head-admin/shops/', views.get_shops, name='get_shops'),
    path('head-admin/verify-shop/', views.verify_shop, name='verify_shop'),
    path('head-admin/deactivate-shop/', views.deactivate_shop, name='deactivate_shop'),
    path('head-admin/activate-shop/', views.activate_shop, name='activate_shop'),

    # Head Admin Token Management
    path('head-admin/token-purchases/', views.get_token_purchases, name='get_token_purchases'),
    
    # Head Admin Dispute Management
    path('head-admin/disputes/', views.get_disputes, name='get_disputes'),
    path('head-admin/resolve-dispute/', views.resolve_dispute, name='resolve_dispute'),
    
    # Head Admin Report Management
    path('head-admin/reports/', views.get_reports, name='get_reports'),
    path('head-admin/review-report/', views.review_report, name='review_report'),
    path('head-admin/dismiss-report/', views.dismiss_report, name='dismiss_report'),
    
    # Head Admin Financial Management
    path('head-admin/financial/stats/', views.get_financial_stats, name='get_financial_stats'),
    path('head-admin/financial/transactions/', views.get_financial_transactions, name='get_financial_transactions'),
    path('head-admin/commission/settings/', views.commission_settings, name='commission_settings'),

    # Head Admin Account Management
    path('head-admin/admin-accounts/', views.manage_admin_accounts, name='manage_admin_accounts'),
    path('head-admin/admin-accounts/<int:admin_id>/', views.manage_admin_accounts, name='manage_admin_accounts_detail'),
    path('head-admin/admin-accounts/<int:admin_id>/toggle-active/', views.toggle_admin_active, name='toggle_admin_active'),
    
    # Head Admin Token Pricing
    path('head-admin/token-pricing/', views.manage_token_pricing, name='manage_token_pricing'),
    path('head-admin/token-pricing/<int:package_id>/', views.manage_token_pricing, name='manage_token_pricing_detail'),
]

