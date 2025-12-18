from django.urls import path
from . import views

urlpatterns = [
    # Request creation
    path('custom/create/', views.create_custom_request, name='create_custom_request'),
    
    # Request management
    path('client/', views.get_client_requests, name='get_client_requests'),
    path('provider/', views.get_provider_requests, name='get_provider_requests'),
    path('mechanic/available/', views.get_mechanic_available_requests, name='get_mechanic_available_requests'),
    path('mechanic/pending/', views.get_mechanic_pending_requests, name='get_mechanic_pending_requests'),
    path('mechanic/quoted/', views.get_mechanic_quoted_requests, name='get_mechanic_quoted_requests'),
    path('<int:request_id>/', views.get_request_detail, name='get_request_detail'),
    path('<int:request_id>/status/', views.update_request_status, name='update_request_status'),
    path('<int:request_id>/delete/', views.delete_request, name='delete_request'),
    path('<int:request_id>/assign/', views.assign_provider_to_request, name='assign_provider_to_request'),
    path('<int:request_id>/accept/', views.accept_request, name='accept_request'),
    path('<int:request_id>/quote/', views.create_direct_request_quotation, name='create_direct_request_quotation'),
    
    # Health check
    path('health/', views.health_check, name='requests_health_check'),
]