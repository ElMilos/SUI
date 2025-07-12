import os
import discord
import asyncio
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CHANNEL_ID = int(os.getenv("DISCORD_CHANNEL_ID"))

intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
client = discord.Client(intents=intents)

# Aktywne inicjatywy
active_proposals = {}  # {proposal_id: {author_id, start_time, text, messages}}

@client.event
async def on_ready():
    print(f"🔗 Zalogowano jako {client.user}")

@client.event
async def on_message(message):
    if message.author.bot:
        return

    # 🔹 Nowa propozycja
    if message.content.startswith("!proposal"):
        proposal_id = message.id
        active_proposals[proposal_id] = {
            "author_id": message.author.id,
            "text": message.content,
            "start_time": datetime.utcnow(),
            "messages": [],
            "channel_id": message.channel.id
        }
        await message.channel.send(f"🗳️ Inicjatywa zapisana! ID: `{proposal_id}` — oczekiwanie na dyskusję i głosowanie.")
        return

    # 🔹 Głosowanie ręczne (autor pisze `!vote`)
    for pid, proposal in active_proposals.items():
        if message.author.id == proposal["author_id"] and message.content.lower().strip() == "!vote":
            await start_voting(pid)
            break

# 🔸 Funkcja głosowania (symulacja)
async def start_voting(proposal_id):
    proposal = active_proposals.get(proposal_id)
    if not proposal:
        return

    channel = client.get_channel(proposal["channel_id"])
    text = proposal["text"]
    await channel.send(f"🗳️ Głosowanie rozpoczęte dla inicjatywy:\n```{text}```\nOdpowiedz ✅ (za) lub ❌ (przeciw) w ciągu 60 sekund.")

    # Dodaj reakcje do głosowania
    proposal_message = await channel.fetch_message(proposal_id)
    await proposal_message.add_reaction("✅")
    await proposal_message.add_reaction("❌")

    # Czekamy 60 sekund na głosy
    await asyncio.sleep(60)

    # Pobierz ponownie wiadomość
    updated = await channel.fetch_message(proposal_id)
    votes_yes = 0
    votes_no = 0
    for reaction in updated.reactions:
        if str(reaction.emoji) == "✅":
            votes_yes = reaction.count - 1  # bez bota
        elif str(reaction.emoji) == "❌":
            votes_no = reaction.count - 1

    await channel.send(f"📊 Wyniki głosowania:\n✅ ZA: {votes_yes}\n❌ PRZECIW: {votes_no}")
    del active_proposals[proposal_id]
