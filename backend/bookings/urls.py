from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='bookings_health'),
    
    # Client bookings
    path('client/', views.client_bookings_list, name='client_bookings_list'),
    path('<int:booking_id>/', views.booking_detail, name='booking_detail'),
    
    # Specific booking types
    path('active/<int:booking_id>/', views.active_booking_detail, name='active_booking_detail'),
    path('completed/<int:booking_id>/', views.completed_booking_detail, name='completed_booking_detail'),
    
    # Lists by status (alternative endpoints for specific statuses)
    path('rescheduled/', views.rescheduled_bookings_list, name='rescheduled_bookings_list'),
    path('cancelled/', views.cancelled_bookings_list, name='cancelled_bookings_list'),
    path('back-jobs/', views.back_jobs_bookings_list, name='back_jobs_bookings_list'),
    path('disputed/', views.disputed_bookings_list, name='disputed_bookings_list'),
    path('refunded/', views.refunded_bookings_list, name='refunded_bookings_list'),
]