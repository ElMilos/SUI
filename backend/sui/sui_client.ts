import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { JsonRpcProvider } from '@mysten/sui/providers/json-rpc-provider';
import { RawSigner } from '@mysten/sui/signers/raw-signer';
import { SuiObjectResponse } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui/transactions';
import * as dotenv from 'dotenv';

import {Transaction} from '@mysten/sui/transactions';

dotenv.config();

const PACKAGE_ID = '0xa20d316d00073b9dcd732cdd74784b17b02646581a6287c2b68809279fda66a5';
const DAO_ID = '0x762a068cbcb8dfb76fef3f1b4219a33ead3dfd294b25794e11d7aa0a6170b72e';
const FULLNODE_URL = 'https://fullnode.devnet.sui.io:443';

// 🔐 Klucz prywatny z .env
const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY;

if (!PRIVATE_KEY_BASE64) {
  throw new Error('Brakuje klucza prywatnego (SUI_PRIVATE_KEY) w pliku .env');
}

const secretKey = Buffer.from(PRIVATE_KEY_BASE64, 'base64').slice(1);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const provider = new JsonRpcProvider({ fullnode: FULLNODE_URL });
const signer = new RawSigner(keypair, provider);

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

async function getDaoState(daoId: string): Promise<DaoObject> {
  const object: SuiObjectResponse = await provider.getObject({
    id: daoId,
    options: { showContent: true },
  });

  const fields = object.data?.content?.fields as DaoObject;
  console.log('DAO:', fields);
  return fields;
}

async function createProposal(daoId: string, title: string, description: string): Promise<void> {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [tx.pure(daoId), tx.pure(title), tx.pure(description)],
  });

  const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  console.log('✅ Proposal created:', result.digest);
}

async function voteOnProposal(daoId: string, proposalId: number, inFavor: boolean): Promise<void> {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::vote`,
    arguments: [tx.pure(daoId), tx.pure(proposalId), tx.pure(inFavor)],
  });

  const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  console.log('✅ Voted:', result.digest);
}

// Mock analiza sentymentu
function mockSentimentAnalysis(): boolean {
  return true;
}

async function agentDecisionLoop(): Promise<void> {
  const dao = await getDaoState(DAO_ID);
  const proposals = dao.proposals ?? [];

  if (!proposals.length) {
    console.log('Brak propozycji.');
    return;
  }

  const latest = proposals[proposals.length - 1];
  const proposalId = parseInt(latest.fields.id);

  if (mockSentimentAnalysis()) {
    console.log(`Głosuję ZA propozycją ${proposalId}`);
    await voteOnProposal(DAO_ID, proposalId, true);
  } else {
    console.log(`Głosuję PRZECIW propozycji ${proposalId}`);
    await voteOnProposal(DAO_ID, proposalId, false);
  }
}

agentDecisionLoop().catch(console.error);