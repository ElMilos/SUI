import { Ed25519Keypair, JsonRpcProvider, RawSigner, TransactionBlock } from '@mysten/sui.js';
import * as dotenv from 'dotenv';
dotenv.config();

const PACKAGE_ID = '0xa20d316d00073b9dcd732cdd74784b17b02646581a6287c2b68809279fda66a5';
const DAO_ID = '0x762a068cbcb8dfb76fef3f1b4219a33ead3dfd294b25794e11d7aa0a6170b72e';
const FULLNODE_URL = 'https://fullnode.devnet.sui.io:443';

// 🔐 Wczytaj klucz prywatny z ENV
const PRIVATE_KEY_BASE64 = process.env.SUI_PRIVATE_KEY; // musi być base64-encoded

if (!PRIVATE_KEY_BASE64) {
  throw new Error('Brak klucza prywatnego (SUI_PRIVATE_KEY) w .env');
}

const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(PRIVATE_KEY_BASE64, 'base64').slice(1));
const provider = new JsonRpcProvider(FULLNODE_URL);
const signer = new RawSigner(keypair, provider);

async function getDaoState(daoId) {
  const object = await provider.getObject({
    id: daoId,
    options: { showContent: true },
  });

  console.log('DAO:', object.data.content.fields);
  return object.data.content.fields;
}

async function createProposal(daoId, title, description) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
      tx.pure(daoId),
      tx.pure(title),
      tx.pure(description),
    ],
  });

  const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  console.log('✅ Proposal created:', result.digest);
}

async function voteOnProposal(daoId, proposalId, inFavor) {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${PACKAGE_ID}::dao::vote`,
    arguments: [
      tx.pure(daoId),
      tx.pure(proposalId),
      tx.pure(inFavor),
    ],
  });

  const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
  console.log('✅ Voted:', result.digest);
}

// Prosty mock analizy sentymentu
function mockSentimentAnalysis() {
  return true; // np. analiza NLP wykazała >60% pozytywnego sentymentu
}

async function agentDecisionLoop() {
  const dao = await getDaoState(DAO_ID);
  const proposals = dao.proposals || [];

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