import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl, SuiObjectResponse } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
dotenv.config();

// Wczytywanie zmiennych środowiskowych
const PACKAGE_ID = process.env.SUI_PACKAGE_ID;
const DAO_ID = process.env.SUI_DAO_ID;
const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY!;
const secretKeyBuffer = Buffer.from(PRIVATE_KEY_BASE64, 'base64').slice(1);
const secretKey = new Uint8Array(secretKeyBuffer);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const sender = keypair.getPublicKey().toSuiAddress();

// Możliwość ustawienia sieci (devnet/testnet/mainnet) lub bezpośredniego URL
const SUI_NETWORK = process.env.SUI_NETWORK; // np. 'devnet'
const FULLNODE_URL = process.env.SUI_FULLNODE_URL || (SUI_NETWORK ? getFullnodeUrl(SUI_NETWORK as 'mainnet' | 'devnet' | 'devnet' | 'localnet') : undefined);

// Walidacja
if (!PACKAGE_ID) throw new Error('Brakuje zmiennej środowiskowej SUI_PACKAGE_ID');
if (!DAO_ID) throw new Error('Brakuje zmiennej środowiskowej DAO_ID');
if (!PRIVATE_KEY_BASE64) throw new Error('Brakuje zmiennej środowiskowej SUI_PRIVATE_KEY');
if (!FULLNODE_URL) throw new Error('Brakuje zmiennej środowiskowej SUI_FULLNODE_URL lub SUI_NETWORK');



const client = new SuiClient({ url: FULLNODE_URL });

interface DaoProposal {
  fields: {
    id: string;
    title?: string;
    description?: string;
    votes?: any;
    status?: string;
  };
}

interface DaoObject {
  proposals: DaoProposal[];
}

export async function inviteMember(daoAddress: string, newMemberAddress: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::invite_member`,
    arguments: [
      tx.object(daoAddress),        // &mut DAO
      tx.pure.string(newMemberAddress),    // nowy członek
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

  console.log('✅ Member invited:', result.digest);
}

// ✅ Istniejąca funkcja: pobiera DAO
export async function getDaoState(daoId: string): Promise<DaoObject> {
  const object: SuiObjectResponse = await client.getObject({
    id: daoId,
    options: { showContent: true },
  });

  if ('error' in object && object.error?.code === 'notExists') {
    throw new Error(`Obiekt DAO o ID ${daoId} nie istnieje.`);
  }

  if (!('data' in object) || !object.data) {
    throw new Error('Brak pola `data` w odpowiedzi Sui.');
  }


  const content: any = (object.data as any).content;
  if (!content) {
    throw new Error('Brak pola `data.content` – prawdopodobnie używasz złego object ID.');
  }

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

  const fields = (content as any).fields as DaoObject;
  if (!Array.isArray(fields.proposals)) {
    throw new Error('Pole `fields.proposals` nie jest tablicą.');
  }

  return fields;
}


// 🆕 Tworzenie DAO
export async function createDao(): Promise<void> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_dao`,
    arguments: [],
  });

  const txBytes = await tx.build({ client });
  const { signature } = await keypair.signTransaction(txBytes);

  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true },
    requestType: 'WaitForLocalExecution',
  });

  console.log('✅ DAO created:', result.digest);
}

export async function createProposal(title: string, description: string): Promise<void> {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
      tx.object(DAO_ID as string),               // &mut DAO
      tx.pure.string(title),                     // title: string
      tx.pure.string(description),               // summary: string
      tx.pure.u64(Date.now()),                   // date: u64
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


// 🆕 Start voting (tylko autor)
export async function startVoting(proposalId: number): Promise<void> {
  const tx = new Transaction();

  const daoObject = tx.object(DAO_ID as string);
  tx.setSender(sender);
  tx.setGasBudget(50_000_000);

  // TYLKO JEDNO WYWOŁANIE - start_voting z modułu DAO emituje już AgentEvent
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::start_voting`, // To wywoła emitowanie AgentEvent w Move
    arguments: [
      daoObject,
      tx.pure.u64(proposalId),
    ],
  });

  const txBytes = await tx.build({ client });
  const { signature } = await keypair.signTransaction(txBytes);

  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true, showEvents: true }, // Dodaj showEvents: true
    requestType: "WaitForLocalExecution",
  });

  console.log(`✅ Voting started for proposal ${proposalId}:`, result.digest);
}


// Endpoint do głosowania
export async function voteOnProposal(
  proposalId: number,
  voteCode: 0 | 1 | 2,
  sentiment: number,
  confidence: number
): Promise<void> {
  const tx = new Transaction();

  const daoObject = tx.object(DAO_ID as string);
    tx.setSender(sender);
    tx.setGasBudget(50_000_000); 

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::vote`,
    arguments: [
      daoObject,
      tx.pure.u64(proposalId),
      tx.pure.u8(voteCode),
      tx.pure.u64(Math.floor(Date.now() / 1000)), // Timestamp in seconds
      tx.pure.u64(sentiment),
      tx.pure.u64(confidence),
    ],
  });

  const txBytes = await tx.build({ client });
  
  // Podpisanie transakcji przed jej wysłaniem
  const { signature } = await keypair.signTransaction(txBytes);  // Sign the transaction

  // Wykonanie transakcji
  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true },
    requestType: "WaitForLocalExecution",
  });

  console.log(`✅ Vote casted for proposal ${proposalId}:`, result.digest);
}
export async function closeVotingOnProposal(proposalId: number): Promise<void> {
  const tx = new Transaction();

  const daoObject = tx.object(DAO_ID as string);
  tx.setSender(sender);
  tx.setGasBudget(50_000_000);

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::close_voting`,
    arguments: [
      daoObject,
      tx.pure.u64(proposalId),
    ],
  });
  const txBytes = await tx.build({ client });
  
  // Podpisanie transakcji przed jej wysłaniem
  const { signature } = await keypair.signTransaction(txBytes);  

  // Wyślij transakcję
   const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: { showEffects: true },
    requestType: "WaitForLocalExecution",
  });

  console.log('Voting closed. Transaction digest:', result.digest);
}

export async function giveFeedback(proposalId: number, reaction: string): Promise<void> {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::give_feedback`,
    arguments: [
      tx.object(DAO_ID as string),           // poprawnie: &mut DAO
      tx.pure.u64(proposalId),               // proposal ID
      tx.pure.string(reaction),              // feedback string
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

  console.log('💬 Feedback sent:', result.digest);
}





