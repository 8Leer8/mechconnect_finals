# Import all view functions to make them accessible from accounts.views
from .authentication import (
    register, login, profile, update_profile, change_password,
    password_reset_request, password_reset_confirm
)
from .users import (
    get_users, get_user_by_id, deactivate_user, activate_user, 
    verify_user, user_notifications, mark_notification_read,
    discover_mechanics, get_available_barangays, get_all_users, ban_user, unban_user, mechanic_detail,
    get_client_address
)
from .dashboard import head_admin_dashboard_stats, health_check
from .verifications import get_verifications, verify_user_verification, reject_verification
from .shops import get_shops, verify_shop, deactivate_shop, activate_shop
from .tokens import get_token_purchases, manage_token_pricing
from .disputes import get_disputes, resolve_dispute
from .reports import get_reports, review_report, dismiss_report
from .financial import get_financial_stats, get_financial_transactions, commission_settings
from .account_management import manage_admin_accounts, toggle_admin_active

__all__ = [
    # Authentication
    'register', 'login', 'profile', 'update_profile', 'change_password',
    'password_reset_request', 'password_reset_confirm',
    # Users
    'get_users', 'get_user_by_id', 'deactivate_user', 'activate_user', 
    'verify_user', 'user_notifications', 'mark_notification_read',
    'discover_mechanics', 'get_available_barangays', 'get_all_users', 'ban_user', 'unban_user', 'mechanic_detail',
    'get_client_address',
    # Dashboard
    'head_admin_dashboard_stats', 'health_check',
    # Verifications
    'get_verifications', 'verify_user_verification', 'reject_verification',
    # Shops
    'get_shops', 'verify_shop', 'deactivate_shop', 'activate_shop',
    # Tokens
    'get_token_purchases', 'manage_token_pricing',
    # Disputes
    'get_disputes', 'resolve_dispute',
    # Reports
    'get_reports', 'review_report', 'dismiss_report',
    # Financial
    'get_financial_stats', 'get_financial_transactions', 'commission_settings',
    # Account Management
    'manage_admin_accounts', 'toggle_admin_active',
]
