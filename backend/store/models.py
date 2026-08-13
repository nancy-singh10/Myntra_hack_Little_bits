from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100,unique=True)
    slug=models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category=models.ForeignKey(Category,related_name='products',on_delete=models.CASCADE)
    name=models.CharField(max_length=200,unique=True)
    description=models.TextField()
    price=models.DecimalField(max_digits=10,decimal_places=2)
    image=models.ImageField(upload_to='products/', blank=True, null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name   

class Order(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)
    total_amount=models.DecimalField(max_digits=10,decimal_places=2)

    
    def __str__(self):
        return str(self.user.username)    
    
class OrderItem(models.Model):
    order=models.ForeignKey(Order,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    quantity=models.PositiveIntegerField()
    price=models.DecimalField(max_digits=10,decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}" 

class Cart(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Cart{self.id} for {self.user}"
    # do sum on cart value
    @property
    def total(self):
        return sum(item.subtotal for item in self.cartitem_set.all())

class CartItem(models.Model):
    cart=models.ForeignKey(Cart,on_delete=models.CASCADE)
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    quantity=models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    @property
    def subtotal(self):
        return self.quantity* self.product.price
        
class Squad(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)
    members = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SharedCartItem(models.Model):
    squad = models.ForeignKey(Squad, on_delete=models.CASCADE, related_name='items')
    added_by = models.CharField(max_length=100, blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

class ItemComment(models.Model):
    item = models.ForeignKey(SharedCartItem, on_delete=models.CASCADE, related_name='comments')
    user = models.CharField(max_length=100, blank=True, null=True)
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class UserSessionCart(models.Model):
    user_id = models.CharField(max_length=100, default='default_user', unique=True)
    cart_data = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class UserLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='location', null=True, blank=True)
    pincode = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.city} ({self.pincode})"

class UserCalendarIntegration(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='calendar_auth', null=True, blank=True)
    access_token = models.CharField(max_length=255)
    refresh_token = models.CharField(max_length=255, null=True, blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Calendar Auth for {self.user}"

class WardrobeItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wardrobe', null=True, blank=True)
    product_category = models.CharField(max_length=100)
    attributes = models.JSONField(default=dict, blank=True)
    purchase_date = models.DateField(auto_now_add=True)
    image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.product_category} for {self.user}"