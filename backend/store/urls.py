from django.urls import path 
from . import views

urlpatterns = [
    path('products/', views.get_products),
    path('products/<int:pk>/', views.get_products),
    path('categories/', views.get_categories),
    path('cart/', views.get_cart),
    path('cart/sync/', views.sync_cart),
    path('cart/add/', views.add_to_cart),
    path('cart/remove/', views.remove_from_cart),
    path('try-on/', views.virtual_try_on),
    path('squads/', views.squad_list_create),
    path('squads/<int:squad_id>/', views.squad_detail),
    path('squads/<int:squad_id>/items/', views.squad_items),
    path('squads/<int:squad_id>/comments/', views.squad_comments),
    path('stylist/feed/', views.daily_stylist_feed),
    path('stylist/recommend/', views.recommend_outfit),
]