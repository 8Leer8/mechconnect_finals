from django.urls import path
from . import views

urlpatterns = [
    # Discovery
    path('discover/', views.discover_shops, name='discover_shops'),
    # Shop Detail
    path('detail/<int:shop_id>/', views.shop_detail, name='shop_detail'),
]
