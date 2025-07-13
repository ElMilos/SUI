import { Client, GatewayIntentBits } from 'discord.js';
import { SuiClient, getFullnodeUrl, SuiObjectResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as dotenv from 'dotenv';

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const PACKAGE_ID = process.env.SUI_PACKAGE_ID!;
const DAO_ID = process.env.SUI_DAO_ID!;
const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY!;
const DSC_ID = process.env.TARGET_DISCORD_USERNAME_ID!;

const secretKeyBuffer = Buffer.from(PRIVATE_KEY_BASE64, 'base64').slice(1);
const secretKey = new Uint8Array(secretKeyBuffer);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const suiClient = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });
const sender = keypair.getPublicKey().toSuiAddress();
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
import * as Sui from '../sui/sui_client';


async function createProposalByDiscord(title: string, description: string) {
  const tx = new Transaction();
    tx.setSender(sender);
    tx.setGasBudget(50_000_000); 
    tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
      tx.object(DAO_ID as string),               // &mut DAO
      tx.pure.string(title),                     // title: string
      tx.pure.string(description),               // summary: string
      tx.pure.u64(Date.now()),                   // date: u64
    ],
  });

  const txBytes = await tx.build({ client: suiClient});
  const { signature } = await keypair.signTransaction(txBytes);

    const result = await suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature,
        options: {
            showEffects: true,
            showRawEffects: true, // To jest kluczowe, aby 'output' było dostępne w 'result'
        },
        requestType: 'WaitForLocalExecution',
    });

    return {
        digest: result.digest,
        id: result.digest[0],
        id2: result.digest[1],
    };
}

discordClient.on('ready', () => {
  console.log(`Bot zalogowany jako ${discordClient.user?.tag}`);
});


discordClient.on('messageCreate', async (message) => {
  if (message.author.bot) return;
if (DSC_ID != message.author.id) {
      return;
    }
  // Komenda tworząca propozycję
  if (message.content.startsWith('!proposal')) {
    const content = message.content.slice('!proposal'.length).trim();
    const [title, ...descParts] = content.split('|');
    if (!title || descParts.length === 0) {
      message.reply('Proszę użyj formatu: `!proposal Tytuł | Opis`');
      return;
    }
    const description = descParts.join('|').trim();

    try {
      const txDigest = await createProposalByDiscord(title.trim(), description);
      
      message.reply(`✅ Propozycja utworzona! Tx digest: \`${txDigest.digest}\``);
    } catch (err) {
      console.error('Błąd przy tworzeniu propozycji:', err);
      message.reply('❌ Wystąpił błąd przy tworzeniu propozycji.');
    }
  }

  // Komenda rozpoczynająca głosowanie
  if (message.content.startsWith('!vote')) {
    const parts = message.content.trim().split(' ');
    if (parts.length < 2 || isNaN(Number(parts[1]))) {
      message.reply('Proszę użyj formatu: `!vote <id propozycji>` (np. `!vote 3`)');
      return;
    }

    const proposalId = Number(parts[1]);

    try {
      await Sui.startVoting(proposalId);
      message.reply(`✅ Głosowanie dla propozycji ${proposalId} rozpoczęte.`);
    } catch (err) {
      console.error('Błąd przy rozpoczynaniu głosowania:', err);
      message.reply(`❌ Wystąpił błąd przy rozpoczynaniu głosowania.`);
    }
  }
  if (message.content.startsWith('!EndVote')) {
    const parts = message.content.trim().split(' ');
    if (parts.length < 2 || isNaN(Number(parts[1]))) {
      message.reply('Proszę użyj formatu: `!Endvote <id propozycji>` (np. `!vote 3`)');
      return;
    }

    const proposalId = Number(parts[1]);

    try {
      await Sui.closeVotingOnProposal(proposalId);
      message.reply(`✅ Głosowanie dla propozycji ${proposalId} zakończone.`);
    } catch (err) {
      console.error('Błąd przy kończeniu głosowania:', err);
      message.reply(`❌ Wystąpił błąd przy kończeniu głosowania.`);
    }
  }
});



discordClient.login(DISCORD_TOKEN);
