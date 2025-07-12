import os
from dotenv import load_dotenv

# Ładowanie .env z katalogu głównego
load_dotenv()

# Zmienne środowiskowe (dostępne jako importy w całym projekcie)
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
DISCORD_CHANNEL_ID = int(os.getenv("DISCORD_CHANNEL_ID"))

SUI_ENDPOINT = os.getenv("SUI_ENDPOINT", "https://fullnode.testnet.sui.io:443")
SUI_PACKAGE_ID = os.getenv("SUI_PACKAGE_ID")
SUI_MODULE = os.getenv("SUI_MODULE", "governance")
SUI_ADDRESS = os.getenv("SUI_ADDRESS")
