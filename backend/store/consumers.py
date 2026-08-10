import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SquadCartConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.squad_id = self.scope['url_route']['kwargs']['squad_id']
        self.room_group_name = f'squad_{self.squad_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'send_emoji':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_message',
                    'action': 'emoji_received',
                    'emoji': data.get('emoji'),
                    'item_id': data.get('item_id'),
                    'user': data.get('user')
                }
            )
        elif action == 'send_comment':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_message',
                    'action': 'comment_received',
                    'item_id': data.get('item_id'),
                    'comment_id': data.get('comment_id'),
                    'comment': data.get('comment'),
                    'user': data.get('user')
                }
            )
        elif action == 'join_squad':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_message',
                    'action': 'user_joined',
                    'user': data.get('user')
                }
            )

    async def broadcast_message(self, event):
        await self.send(text_data=json.dumps(event))
