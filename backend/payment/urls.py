from django.urls import path
from . import views

urlpatterns = [
    # Payment creation and updates
    path('create/', views.create_payment, name='create_payment'),
    path('<int:payment_id>/', views.update_payment, name='update_payment'),
    
    # Booking payment information
    path('booking/<int:booking_id>/', views.get_booking_payment, name='get_booking_payment'),
    path('booking/<int:booking_id>/history/', views.list_booking_payments, name='list_booking_payments'),
    
    # User-specific payments
    path('client/<int:client_id>/', views.get_client_payments, name='get_client_payments'),
    path('provider/<int:provider_id>/', views.get_provider_payments, name='get_provider_payments'),
]
