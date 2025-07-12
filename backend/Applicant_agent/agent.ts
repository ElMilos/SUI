import { Client, GatewayIntentBits } from 'discord.js';
import { SuiClient, getFullnodeUrl, SuiObjectResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as dotenv from 'dotenv';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const PACKAGE_ID = process.env.SUI_PACKAGE_ID!;
const DAO_ID = process.env.DAO_ID!;
const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY!;

const secretKey = Buffer.from(PRIVATE_KEY_BASE64, 'base64').slice(1);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const suiClient = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });
const sender = keypair.getPublicKey().toSuiAddress();
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
import * as Sui from '../sui/sui_client';


async function createProposalByDiscord(title: string, description: string) {
  const tx = new Transaction();
    tx.setSender(sender);
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
        tx.object(DAO_ID), 
        tx.pure.string(title),
        tx.pure.string(description),
    ],
  });

  const txBytes = await tx.build({ client: suiClient});
  const { signature } = await keypair.signTransaction(txBytes);

  const result = await suiClient.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true },
    requestType: 'WaitForLocalExecution',
  });

  return result.digest;
}

discordClient.on('ready', () => {
  console.log(`Bot zalogowany jako ${discordClient.user?.tag}`);
});

discordClient.on('messageCreate', async (message) => {
  if (message.author.bot) return; // ignoruj inne boty

  if (message.content.startsWith('!proposal')) {
    // Oczekujemy formatu:
    // !proposal Tytuł | Opis propozycji
    const content = message.content.slice('!proposal'.length).trim();
    const [title, ...descParts] = content.split('|');
    if (!title || descParts.length === 0) {
      message.reply('Proszę użyj formatu: `!proposal Tytuł | Opis`');
      return;
    }
    const description = descParts.join('|').trim();

    try {
      const txDigest = await createProposalByDiscord(title.trim(), description);
      message.reply(`Propozycja utworzona pomyślnie! Tx digest: ${txDigest}`);
    } catch (err) {
      console.error('Błąd przy tworzeniu propozycji:', err);
      message.reply('Wystąpił błąd przy tworzeniu propozycji.');
    }
  }
});

discordClient.login(DISCORD_TOKEN);
