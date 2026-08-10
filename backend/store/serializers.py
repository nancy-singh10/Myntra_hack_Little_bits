from rest_framework import serializers
from .models import Product, Category, Cart, CartItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields='__all__'    

class ProductSerializer(serializers.ModelSerializer):
    category=CategorySerializer(read_only=True)
    class Meta:
        model=Product
        fields='__all__'
class CartItemSerializer(serializers.ModelSerializer):
    product_name=serializers.CharField(source='product.name',read_only=True)
    product_price=serializers.DecimalField(source='product.price',max_digits=10,decimal_places=2,read_only=True)
    product_image=serializers.ImageField(source='product.image',read_only=True)
    subtotal=serializers.DecimalField(read_only=True,max_digits=10,decimal_places=2)
    class Meta:
        model=CartItem
        fields='__all__'
class CartSerializer(serializers.ModelSerializer):
    items=CartItemSerializer(read_only=True,many=True)
    total=serializers.ReadOnlyField()
    class Meta:
        model=Cart
        fields='__all__'

from .models import Squad, SharedCartItem, ItemComment

class SquadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Squad
        fields = '__all__'

class SharedCartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    class Meta:
        model = SharedCartItem
        fields = '__all__'

class ItemCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemComment
        fields = '__all__'