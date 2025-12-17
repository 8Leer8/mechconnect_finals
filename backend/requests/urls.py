from django.urls import path
from . import views

urlpatterns = [
    # Request creation
    path('custom/create/', views.create_custom_request, name='create_custom_request'),
    path('direct/create/', views.create_direct_request, name='create_direct_request'),
    path('emergency/create/', views.create_emergency_request, name='create_emergency_request'),
    
    # Request management
    path('client/', views.get_client_requests, name='get_client_requests'),
    path('provider/', views.get_provider_requests, name='get_provider_requests'),
    path('mechanic/available/', views.get_mechanic_available_requests, name='get_mechanic_available_requests'),
    path('mechanic/pending/', views.get_mechanic_pending_requests, name='get_mechanic_pending_requests'),
    path('<int:request_id>/', views.get_request_detail, name='get_request_detail'),
    path('<int:request_id>/status/', views.update_request_status, name='update_request_status'),
    path('<int:request_id>/delete/', views.delete_request, name='delete_request'),
    path('<int:request_id>/assign/', views.assign_provider_to_request, name='assign_provider_to_request'),
    path('<int:request_id>/accept/', views.accept_request, name='accept_request'),
    path('cancel/', views.cancel_request, name='cancel_request'),
    
    # Quotation management
    path('<int:request_id>/create-quote/', views.create_quoted_items, name='create_quoted_items'),
    path('<int:request_id>/accept-quotation/', views.accept_quotation, name='accept_quotation'),
    path('<int:request_id>/reject-quotation/', views.reject_quotation, name='reject_quotation'),
    
    # Health check
    path('health/', views.health_check, name='requests_health_check'),
]