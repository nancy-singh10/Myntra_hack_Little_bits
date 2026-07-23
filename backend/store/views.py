import os
import tempfile
import shutil
import requests
from gradio_client import Client, handle_file
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product, Category, Cart, CartItem
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer
# Create your views here.

@api_view(['GET'])
def get_products(request, pk=None):
    if pk:
        product=Product.objects.filter(pk=pk)
    else:
        product=Product.objects.all()
    serializer=ProductSerializer(product,many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_categories(request):
    category = Category.objects.all()
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data)        

# cart
@api_view(['GET'])
def get_cart(request):
    cart,created=Cart.objects.get_or_create(user=None)
    serializer=CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
def add_to_cart(request):
   product_id=request.data.get('product_id')
   product=Product.objects.get(id=product_id)
   cart,created=Cart.objects.get_or_create(user=None)
   item,created=CartItem.objects.get_or_create(cart=cart,product=product,defaults={'quantity': 1})
   if not created:
    item.quantity +=1
    item.save()
   return Response({'message':'item added to cart','cart':CartSerializer(cart).data})

@api_view(['POST'])
def remove_from_cart(request, pk=None):
    item_id=request.data.get('item_id')
    item=CartItem.objects.get(id=item_id)
    cart=item.cart
    item.delete()
    return Response({'message':'item removed from cart','cart':CartSerializer(cart).data})

@api_view(['POST'])
def virtual_try_on(request):
    user_image_file = request.FILES.get('user_image')
    garment_image_file = request.FILES.get('garment_image')

    if not user_image_file or not garment_image_file:
        return Response({'error': 'user_image and garment_image are required'}, status=400)

    try:
        # Save user image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_user_img:
            for chunk in user_image_file.chunks():
                temp_user_img.write(chunk)
            temp_user_img_path = temp_user_img.name

        # Save garment image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_garment_img:
            for chunk in garment_image_file.chunks():
                temp_garment_img.write(chunk)
            garment_img_path = temp_garment_img.name

        media_dir = os.path.join('media', 'tryon_results')
        os.makedirs(media_dir, exist_ok=True)
        final_filename = f"tryon_{os.path.basename(temp_user_img_path)}"
        final_filepath = os.path.join(media_dir, final_filename)

        # --- 100% FREE: franciszzj/Leffa on HuggingFace ---
        # No API key, no credit card, no payment needed.
        # State-of-the-art virtual try-on using the Leffa model.
        client = Client("franciszzj/Leffa")
        result = client.predict(
            src_image_path=handle_file(temp_user_img_path),  # person image
            ref_image_path=handle_file(garment_img_path),    # garment image
            ref_acceleration="False",
            step=30,
            scale=2.5,
            seed=42,
            vt_model_type="viton_hd",
            vt_garment_type="upper_body",
            vt_repaint="False",
            api_name="/leffa_predict_vt"
        )

        # Result is a tuple: (generated_image, generated_mask, generated_densepose)
        # Each is a dict with 'path' key pointing to local temp file
        result_image = result[0]
        result_path = result_image['path'] if isinstance(result_image, dict) else result_image
        shutil.copy2(result_path, final_filepath)

        # Clean up temp files
        if os.path.exists(temp_user_img_path):
            os.remove(temp_user_img_path)
        if os.path.exists(garment_img_path):
            os.remove(garment_img_path)

        return Response({'tryon_image_url': f'/media/tryon_results/{final_filename}'})

    except Exception as e:
        return Response({'error': str(e)}, status=500)