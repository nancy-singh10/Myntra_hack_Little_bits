import os
import tempfile
import shutil
import requests
import time
from gradio_client import Client, handle_file
from django.shortcuts import render
from django.conf import settings
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product, Category, Cart, CartItem, Squad, SharedCartItem, ItemComment
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer, SquadSerializer, SharedCartItemSerializer, ItemCommentSerializer
from PIL import Image, ImageFilter

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

def extract_clean_garment(garment_img):
    garment = garment_img.convert("RGBA")
    w, h = garment.size

    corner_colors = [
        garment.getpixel((0, 0)),
        garment.getpixel((w - 1, 0)),
        garment.getpixel((0, h - 1)),
        garment.getpixel((w - 1, h - 1))
    ]

    bg_r = sum(c[0] for c in corner_colors) / 4.0
    bg_g = sum(c[1] for c in corner_colors) / 4.0
    bg_b = sum(c[2] for c in corner_colors) / 4.0

    datas = garment.getdata()
    new_data = []

    for item in datas:
        r, g, b, a = item
        dist = ((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2) ** 0.5
        if dist < 50 or (r > 230 and g > 230 and b > 230):
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, 255))

    garment.putdata(new_data)

    bbox = garment.getbbox()
    if bbox:
        garment = garment.crop(bbox)

    return garment

def process_vton_pipeline(user_img_path, garment_img_path, output_filepath, category="Upper-body"):
    user_img = Image.open(user_img_path).convert("RGBA")
    raw_garment = Image.open(garment_img_path)

    clean_garment = extract_clean_garment(raw_garment)

    user_w, user_h = user_img.size

    if "lower" in str(category).lower() or "bottom" in str(category).lower():
        target_w = int(user_w * 0.48)
        aspect = clean_garment.height / max(1, clean_garment.width)
        target_h = int(target_w * aspect)
        resized_garment = clean_garment.resize((target_w, target_h), Image.Resampling.LANCZOS)
        pos_x = int((user_w - target_w) / 2)
        pos_y = int(user_h * 0.50)
    else:
        target_w = int(user_w * 0.52)
        aspect = clean_garment.height / max(1, clean_garment.width)
        target_h = int(target_w * aspect)
        resized_garment = clean_garment.resize((target_w, target_h), Image.Resampling.LANCZOS)
        pos_x = int((user_w - target_w) / 2)
        pos_y = int(user_h * 0.28)

    composite = Image.new("RGBA", (user_w, user_h))
    composite.paste(user_img, (0, 0))
    composite.paste(resized_garment, (pos_x, pos_y), resized_garment)

    final_rgb = composite.convert("RGB")
    final_rgb.save(output_filepath, "JPEG", quality=95)
    return output_filepath

@api_view(['POST'])
def virtual_try_on(request):
    user_image_file = request.FILES.get('user_image')
    garment_image_file = request.FILES.get('garment_image')
    category = request.data.get('category', 'Upper-body')

    if not user_image_file or not garment_image_file:
        return Response({'error': 'user_image and garment_image are required'}, status=400)

    try:
        # Load user uploaded photo to check aspect ratio
        orig_user_img = Image.open(user_image_file).convert("RGBA")
        orig_w, orig_h = orig_user_img.size
        user_aspect = orig_h / orig_w
        target_aspect = 4 / 3

        # Calculate padding to fit 3:4 aspect ratio without stretching
        if user_aspect > target_aspect:
            # Taller than 3:4, pad width
            padded_w = int(orig_h / target_aspect)
            # Match background color using corner pixels
            corner_colors = [orig_user_img.getpixel((0, 0)), orig_user_img.getpixel((orig_w-1, 0)), orig_user_img.getpixel((0, orig_h-1)), orig_user_img.getpixel((orig_w-1, orig_h-1))]
            bg_color = (int(sum(c[0] for c in corner_colors)/4), int(sum(c[1] for c in corner_colors)/4), int(sum(c[2] for c in corner_colors)/4), 255)
            padded_img = Image.new('RGBA', (padded_w, orig_h), bg_color)
            left = (padded_w - orig_w) // 2
            padded_img.paste(orig_user_img, (left, 0))
            crop_box = (left, 0, left + orig_w, orig_h)
            resize_target = (padded_w, orig_h)
        else:
            # Wider than 3:4, pad height
            padded_h = int(orig_w * target_aspect)
            corner_colors = [orig_user_img.getpixel((0, 0)), orig_user_img.getpixel((orig_w-1, 0)), orig_user_img.getpixel((0, orig_h-1)), orig_user_img.getpixel((orig_w-1, orig_h-1))]
            bg_color = (int(sum(c[0] for c in corner_colors)/4), int(sum(c[1] for c in corner_colors)/4), int(sum(c[2] for c in corner_colors)/4), 255)
            padded_img = Image.new('RGBA', (orig_w, padded_h), bg_color)
            top = (padded_h - orig_h) // 2
            padded_img.paste(orig_user_img, (0, top))
            crop_box = (0, top, orig_w, top + orig_h)
            resize_target = (orig_w, padded_h)

        # Save padded human image to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_user_img:
            padded_img.convert("RGB").save(temp_user_img, "JPEG", quality=95)
            temp_user_img_path = temp_user_img.name

        # Save original human image to another temp file (for fallback pipeline)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_orig_user_img:
            orig_user_img.convert("RGB").save(temp_orig_user_img, "JPEG", quality=95)
            temp_orig_user_img_path = temp_orig_user_img.name

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_garment_img:
            for chunk in garment_image_file.chunks():
                temp_garment_img.write(chunk)
            garment_img_path = temp_garment_img.name

        media_dir = os.path.join(settings.MEDIA_ROOT, 'tryon_results')
        os.makedirs(media_dir, exist_ok=True)
        final_filename = f"tryon_{int(time.time()*1000)}.jpg"
        final_filepath = os.path.join(media_dir, final_filename)

        import base64
        from dotenv import load_dotenv
        
        # Explicitly load .env from the backend root
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
        load_dotenv(env_path)
        
        from google import genai
        from google.genai import types
        
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise Exception("GEMINI_API_KEY not found in environment")
            
        ai = genai.Client(api_key=api_key)
        
        with open(temp_user_img_path, 'rb') as f:
            person_b64 = base64.b64encode(f.read()).decode('utf-8')
        with open(garment_img_path, 'rb') as f:
            garment_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        prompt = "Put the clothing shown in image 2 onto the person in image 1. Preserve the person's face, body proportions, pose, and background. Make the garment look naturally worn with realistic folds and lighting."
        
        response = ai.models.generate_content(
            model='gemini-3.1-flash-image',
            contents=[
                prompt,
                types.Part.from_dict({"inline_data": {"mime_type": "image/jpeg", "data": person_b64}}),
                types.Part.from_dict({"inline_data": {"mime_type": "image/jpeg", "data": garment_b64}})
            ]
        )
        
        try:
            image_data = response.candidates[0].content.parts[0].inline_data.data
        except (IndexError, AttributeError):
            raise Exception("Invalid response from Gemini API: missing inline_data")

        if isinstance(image_data, str):
            image_bytes = base64.b64decode(image_data)
        else:
            image_bytes = image_data
            
        with open(final_filepath, 'wb') as f:
            f.write(image_bytes)

        # Clean up temp files
        if os.path.exists(temp_user_img_path):
            os.remove(temp_user_img_path)
        if os.path.exists(temp_orig_user_img_path):
            os.remove(temp_orig_user_img_path)
        if os.path.exists(garment_img_path):
            os.remove(garment_img_path)

        return Response({'tryon_image_url': f'/media/tryon_results/{final_filename}'})

    except Exception as e:
        print(f"Exception details: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
def squad_list_create(request):
    if request.method == 'GET':
        squads = Squad.objects.all().order_by('-created_at')
        serializer = SquadSerializer(squads, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = SquadSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'DELETE'])
def squad_detail(request, squad_id):
    try:
        squad = Squad.objects.get(id=squad_id)
    except Squad.DoesNotExist:
        return Response(status=404)
        
    if request.method == 'GET':
        serializer = SquadSerializer(squad)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        squad.delete()
        return Response(status=204)

@api_view(['GET', 'POST'])
def squad_items(request, squad_id):
    if request.method == 'GET':
        items = SharedCartItem.objects.filter(squad_id=squad_id)
        serializer = SharedCartItemSerializer(items, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        data['squad'] = squad_id
        serializer = SharedCartItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
def squad_comments(request, squad_id):
    if request.method == 'GET':
        comments = ItemComment.objects.filter(item__squad_id=squad_id)
        serializer = ItemCommentSerializer(comments, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ItemCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
