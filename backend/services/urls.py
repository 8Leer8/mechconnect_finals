from django.urls import path
from . import views

urlpatterns = [
    # Discovery
    path('discover/', views.discover_services, name='discover_services'),
    # Service Provider Info
    path('provider/<int:service_id>/', views.service_provider_info, name='service_provider_info'),
    # Service Detail
    path('detail/<int:service_id>/', views.service_detail, name='service_detail'),
    # Service Add-ons
    path('<int:service_id>/addons/', views.get_service_addons, name='get_service_addons'),
]
