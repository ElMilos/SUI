from dotenv import load_dotenv
import os
import discord
import asyncio

load_dotenv()
from config import TOKEN, CHANNEL_ID, TARGET_USER_ID
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

client = discord.Client(intents=intents)
messages = []

@client.event
async def on_ready():
    channel = client.get_channel(CHANNEL_ID)
    async for message in channel.history(limit=100):
        if message.author.id == TARGET_USER_ID:
            messages.append(message.content)
    await client.close()

def fetch_messages():
    asyncio.run(client.start(TOKEN))
    return messages
