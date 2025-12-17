from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='bookings_health'),
    
    # Get booking by request ID
    path('request/<int:request_id>/', views.get_booking_by_request, name='get_booking_by_request'),
    
    # Client bookings
    path('client/', views.client_bookings_list, name='client_bookings_list'),
    
    # Mechanic bookings
    path('mechanic/', views.mechanic_bookings_list, name='mechanic_bookings_list'),
    
    path('<int:booking_id>/', views.booking_detail, name='booking_detail'),
    path('<int:booking_id>/complete/', views.complete_booking, name='complete_booking'),
    
    # Specific booking types
    path('active/<int:booking_id>/', views.active_booking_detail, name='active_booking_detail'),
    path('completed/<int:booking_id>/', views.completed_booking_detail, name='completed_booking_detail'),
    path('rescheduled/<int:booking_id>/', views.rescheduled_booking_detail, name='rescheduled_booking_detail'),
    path('cancelled/<int:booking_id>/', views.cancelled_booking_detail, name='cancelled_booking_detail'),
    path('back-jobs/<int:booking_id>/', views.back_jobs_booking_detail, name='back_jobs_booking_detail'),
    path('disputed/<int:booking_id>/', views.disputed_booking_detail, name='disputed_booking_detail'),
    path('refunded/<int:booking_id>/', views.refunded_booking_detail, name='refunded_booking_detail'),
    
    # Lists by status (alternative endpoints for specific statuses)
    path('rescheduled/', views.rescheduled_bookings_list, name='rescheduled_bookings_list'),
    path('cancelled/', views.cancelled_bookings_list, name='cancelled_bookings_list'),
    path('back-jobs/', views.back_jobs_bookings_list, name='back_jobs_bookings_list'),
    path('disputed/', views.disputed_bookings_list, name='disputed_bookings_list'),
    path('refunded/', views.refunded_bookings_list, name='refunded_bookings_list'),
    
    # Actions
    path('reschedule/', views.request_reschedule, name='request_reschedule'),
    path('complete/', views.mark_booking_complete, name='mark_booking_complete'),
    path('cancel/', views.cancel_booking, name='cancel_booking'),
    path('backjob/<int:backjob_id>/accept/', views.accept_backjob, name='accept_backjob'),
]