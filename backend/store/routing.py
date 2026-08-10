from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/squad/(?P<squad_id>\w+)/$', consumers.SquadCartConsumer.as_asgi()),
]
