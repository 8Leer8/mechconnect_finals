from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
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
]