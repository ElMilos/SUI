import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl, SuiObjectResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import * as dotenv from 'dotenv';

dotenv.config();

const PACKAGE_ID = '0x693c15d34aea1d8d1791ba253bfb51b371f38a098b6f8459b2a5e5dc9bd0f459';
const DAO_ID = '0x266788581219b77cbfc80bb96e130de8d26f1ddc4701a086395fc94db6df5478';
const FULLNODE_URL = 'https://fullnode.devnet.sui.io:443';

const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY;
if (!PRIVATE_KEY_BASE64) {
  throw new Error('Brakuje klucza prywatnego (SUI_PRIVATE_KEY) w pliku .env');
}

const secretKey = Buffer.from(PRIVATE_KEY_BASE64, 'base64').slice(1);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const client = new SuiClient({ url: FULLNODE_URL });

interface DaoProposal {
  fields: {
    id: string;
    title?: string;
    description?: string;
    votes?: any;
  };
}

interface DaoObject {
  proposals: DaoProposal[];
}

export async function getDaoState(daoId: string): Promise<DaoObject> {
  const object: SuiObjectResponse = await client.getObject({
    id: daoId,
    options: { showContent: true },
  });

  // 1) Jeśli zwrócono błąd "notExists"
  if ('error' in object && object.error?.code === 'notExists') {
    throw new Error(`Obiekt DAO o ID ${daoId} nie istnieje.`);
  }

  // 2) Mamy gałąź z danymi
  if (!('data' in object) || !object.data) {
    throw new Error('Brak pola `data` w odpowiedzi Sui.');
  }

  // 3) Wypisujemy surowy JSON dla debugu
  console.log('RAW DAO OBJECT:', JSON.stringify(object, null, 2));

  // 4) Rzutujemy content na `any`, żeby TS nie wieszał się na unionach wewnątrz SuiObjectResponse
  const content: any = (object.data as any).content;
  if (!content) {
    throw new Error('Brak pola `data.content` – prawdopodobnie używasz złego object ID.');
  }

  // 5) Obsługa różnych typów content.dataType
  switch (content.dataType as string) {
    case 'moveObject':
      if (!('fields' in content)) {
        throw new Error('`moveObject` bez pola `fields` – struktura niezgodna.');
      }
      break;
    case 'package':
      throw new Error('To jest paczka (package), a nie instancja zasobu DAO.');
    default:
      throw new Error(`Nieznany dataType: ${(content.dataType as string)}`);
  }

  // 6) Rzutujemy fields na naszą strukturę DaoObject
  const fields = (content as any).fields as DaoObject;
  if (!Array.isArray(fields.proposals)) {
    throw new Error('Pole `fields.proposals` nie jest tablicą.');
  }

  console.log('✅ Parsed DAO fields:', fields);
  return fields;
}

 export async function createProposal(daoId: string, title: string, description: string): Promise<void> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
      tx.pure.string(title),
      tx.pure.string(description),
      tx.pure.u64(0),
      tx.pure.address(daoId),
    ],
  });

  const txBytes = await tx.build({ client });
  const { signature } = await keypair.signTransaction(txBytes);

  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true },
    requestType: 'WaitForLocalExecution',
  });

  console.log('✅ Proposal created:', result.digest);
}

export async function voteOnProposal(daoId: string, proposalId: number, inFavor: boolean): Promise<void> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::vote`,
    arguments: [
      tx.pure.address(daoId),
      tx.pure.u64(proposalId),
      tx.pure.bool(inFavor),
    ],
  });

  const txBytes = await tx.build({ client });
  const { signature } = await keypair.signTransaction(txBytes);

  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true },
    requestType: 'WaitForLocalExecution',
  });

  console.log(`✅ Voted ${inFavor ? 'FOR' : 'AGAINST'} proposal ${proposalId}:`, result.digest);
}

function mockSentimentAnalysis(): boolean {
  return Math.random() > 0.5;
}

export async function agentDecisionLoop(): Promise<void> {
  try {
    const dao = await getDaoState(DAO_ID);
    const proposals = dao.proposals;
    if (!proposals.length) {
      console.log('Brak propozycji.');
      return;
    }
    const latest = proposals[proposals.length - 1];
    const proposalId = parseInt(latest.fields.id, 10);
    if (mockSentimentAnalysis()) {
      console.log(`Głosuję ZA propozycją ${proposalId}`);
      await voteOnProposal(DAO_ID, proposalId, true);
    } else {
      console.log(`Głosuję PRZECIW propozycji ${proposalId}`);
      await voteOnProposal(DAO_ID, proposalId, false);
    }
  } catch (err) {
    console.error('‼️ Błąd w agentDecisionLoop:', (err as Error).message);
  }
}

agentDecisionLoop();
