from django.urls import path
from . import views

urlpatterns = [
    # Discovery
    path('discover/', views.discover_shops, name='discover_shops'),
]
