import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_BOT_TOKEN")
CHANNEL_ID = int(os.getenv("DISCORD_CHANNEL_ID"))
TARGET_USER_ID = int(os.getenv("TARGET_DISCORD_USERNAME_ID"))

SUI_ENDPOINT = os.getenv("SUI_ENDPOINT", "https://fullnode.devnet.sui.io:443")
SUI_PACKAGE_ID = os.getenv("SUI_PACKAGE_ID")
SUI_MODULE = os.getenv("SUI_MODULE", "dao")
SUI_ADDRESS = os.getenv("SUI_ACCOUNT")
