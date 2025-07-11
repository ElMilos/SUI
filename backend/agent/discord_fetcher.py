import discord
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CHANNEL_ID = int(os.getenv("DISCORD_CHANNEL_ID"))

intents = discord.Intents.default()
intents.messages = True
client = discord.Client(intents=intents)

messages = []

@client.event
async def on_ready():
channel = client.get_channel(CHANNEL_ID)
async for message in channel.history(limit=50):
messages.append(message.content)
await client.close()

def fetch_messages():
asyncio.run(client.start(TOKEN))
return messages