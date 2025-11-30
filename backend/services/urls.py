from django.urls import path
from . import views

urlpatterns = [
    # Discovery
    path('discover/', views.discover_services, name='discover_services'),
]
