import os
import tempfile
import shutil
import requests
from gradio_client import Client, handle_file
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product, Category, Cart, CartItem, Squad, SharedCartItem, ItemComment
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer, SquadSerializer, SharedCartItemSerializer, ItemCommentSerializer
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

        # PREVIOUS TRY-ON IMPLEMENTATION COMMENTED OUT AS REQUESTED.
        # # --- 100% FREE: franciszzj/Leffa on HuggingFace ---
        # # No API key, no credit card, no payment needed.
        # # State-of-the-art virtual try-on using the Leffa model.
        # client = Client("franciszzj/Leffa")
        # result = client.predict(
        #     src_image_path=handle_file(temp_user_img_path),  # person image
        #     ref_image_path=handle_file(garment_img_path),    # garment image
        #     ref_acceleration="False",
        #     step=30,
        #     scale=2.5,
        #     seed=42,
        #     vt_model_type="viton_hd",
        #     vt_garment_type="upper_body",
        #     vt_repaint="False",
        #     api_name="/leffa_predict_vt"
        # )
        # 
        # # Result is a tuple: (generated_image, generated_mask, generated_densepose)
        # # Each is a dict with 'path' key pointing to local temp file
        # result_image = result[0]
        # result_path = result_image['path'] if isinstance(result_image, dict) else result_image
        # shutil.copy2(result_path, final_filepath)

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