// agent od discorda:
import { Client, GatewayIntentBits } from "discord.js";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import * as dotenv from "dotenv";
import * as Sui from "../sui/sui_client";
import { io } from "socket.io-client";

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const PACKAGE_ID = process.env.SUI_PACKAGE_ID!;
const DAO_ID = process.env.SUI_DAO_ID!;
const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY!;
const DSC_ID = process.env.TARGET_DISCORD_USERNAME_ID!;
const FULLNODE_URL = process.env.SUI_FULLNODE_URL || getFullnodeUrl("devnet");

const agentSocket = io("http://localhost:3002"); // ZMIEŃ NA 3002

const secretKeyBuffer = Buffer.from(PRIVATE_KEY_BASE64, "base64").slice(1);
const secretKey = new Uint8Array(secretKeyBuffer);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const suiClient = new SuiClient({ url: FULLNODE_URL });
const sender = keypair.getPublicKey().toSuiAddress();
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Inicjalizacja klienta Socket.io do komunikacji z agents_server

// Tablica do przechowywania zebranych wiadomości
let collectedMessages: string[] = [];
// Liczba wiadomości, które chcesz zebrać przed rozpoczęciem analizy
const MESSAGE_COLLECTION_LIMIT = 20; // Możesz dostosować tę wartość

async function createProposalByDiscord(title: string, description: string) {
  const tx = new Transaction();
  tx.setSender(sender);
  tx.setGasBudget(50_000_000);
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
      tx.object(DAO_ID as string),
      tx.pure.string(title),
      tx.pure.string(description),
      tx.pure.u64(Date.now()),
    ],
  });

  const txBytes = await tx.build({ client: suiClient });
  const { signature } = await keypair.signTransaction(txBytes);

  const result = await suiClient.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: {
      showEffects: true,
      showRawEffects: true,
    },
    requestType: "WaitForLocalExecution",
  });

  return {
    digest: result.digest,
    id: "unknown", // Zmieniono na 'unknown', ponieważ nie ma łatwego sposobu na pobranie ID tutaj
  };
}

discordClient.on("ready", () => {
  console.log(`Bot zalogowany jako ${discordClient.user?.tag}`);

  // Subskrybuj zdarzenia z blockchaina Sui
  suiClient.subscribeEvent({
    filter: {
      MoveModule: {
        module: "dao",
        package: PACKAGE_ID,
      },
    },
    onMessage: (event) => {
      console.log(
        "Odebrano zdarzenie z blockchaina:",
        event.type,
        event.parsedJson
      ); // DODAJ TEN LOG
      if (event.type === `${PACKAGE_ID}::dao::AgentEvent`) {
        const eventData = event.parsedJson as any;
        console.log("Zdarzenie AgentEvent odebrane z blockchaina:", eventData); // TEN LOG POWINIEN SIĘ POJAWIĆ

        agentSocket.emit("new_vote", {
          proposalId: eventData.proposal_id,
          status: eventData.status,
          messages: collectedMessages,
        });

        collectedMessages = [];
      }
    },
  });
});

discordClient.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (DSC_ID !== message.author.id) {
    // Jeśli wiadomość nie pochodzi od wyznaczonego użytkownika, nadal ją zbieramy,
    // jeśli chcemy analizować sentyment całej społeczności.
    // Jeśli chcesz tylko wiadomości od konkretnego użytkownika, odkomentuj:
    // return;
  }

  const messageContent = message.content.trim();

  // Sprawdź, czy wiadomość jest komendą bota. Jeśli nie, dodaj ją do zebranych wiadomości.
  if (!messageContent.startsWith("!")) {
    collectedMessages.push(messageContent);
    // Ogranicz liczbę przechowywanych wiadomości, aby nie przeciążać pamięci
    if (collectedMessages.length > MESSAGE_COLLECTION_LIMIT) {
      collectedMessages.shift(); // Usuń najstarszą wiadomość
    }
    console.log(
      `Zebrano wiadomość: "${messageContent}". Łącznie: ${collectedMessages.length}`
    );
  }

  // Komenda tworząca propozycję
  if (messageContent.startsWith("!proposal")) {
    const content = messageContent.slice("!proposal".length).trim();
    const [title, ...descParts] = content.split("|");
    if (!title || descParts.length === 0) {
      message.reply("Proszę użyj formatu: `!proposal Tytuł | Opis`");
      return;
    }
    const description = descParts.join("|").trim();

    try {
      const txResult = await createProposalByDiscord(title.trim(), description);
      message.reply(
        `✅ Propozycja utworzona! Tx digest: \`${txResult.digest}\`.`
      );
    } catch (err) {
      console.error("Błąd przy tworzeniu propozycji:", err);
      message.reply("❌ Wystąpił błąd przy tworzeniu propozycji.");
    }
  }

  // Komenda rozpoczynająca głosowanie
  if (messageContent.startsWith("!vote")) {
    const parts = messageContent.trim().split(" ");
    if (parts.length < 2 || isNaN(Number(parts[1]))) {
      message.reply(
        "Proszę użyj formatu: `!vote <id propozycji>` (np. `!vote 3`)"
      );
      return;
    }

    const proposalId = Number(parts[1]);

    try {
      await Sui.startVoting(proposalId);
      message.reply(
        `✅ Głosowanie dla propozycji ${proposalId} rozpoczęte. Agenci przygotowują się do głosowania.`
      );
    } catch (err) {
      console.error("Błąd przy rozpoczynaniu głosowania:", err);
      message.reply(`❌ Wystąpił błąd przy rozpoczynaniu głosowania.`);
    }
  }
});

discordClient.login(DISCORD_TOKEN);
