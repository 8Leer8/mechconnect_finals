from django.urls import path
from . import views

urlpatterns = [
    # Discovery
    path('discover/', views.discover_shops, name='discover_shops'),
    # Shop Detail
    path('detail/<int:shop_id>/', views.shop_detail, name='shop_detail'),
    # Invite Mechanic
    path('invite-mechanic/', views.invite_mechanic, name='invite_mechanic'),
    # Shop Items
    path('items/', views.get_shop_items, name='get_shop_items'),
    # Add Shop Item
    path('add-item/', views.add_shop_item, name='add_shop_item'),
    # Update Shop Item
    path('items/<int:item_id>/update/', views.update_shop_item, name='update_shop_item'),
    # Delete Shop Item
    path('items/<int:item_id>/delete/', views.delete_shop_item, name='delete_shop_item'),
]
