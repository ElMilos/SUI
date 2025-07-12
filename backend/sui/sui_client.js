import { SuiClient, getFullnodeUrl, SuiTransactionBlock } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Konfiguracja klienta
const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Ustawienia: PACKAGE i DAO
const PACKAGE_ID = "0xa20d316d00073b9dcd732cdd74784b17b02646581a6287c2b68809279fda66a5";
const DAO_ID = "0x762a068cbcb8dfb76fef3f1b4219a33ead3dfd294b25794e11d7aa0a6170b72e";

// Pobierz stan DAO
async function getDaoState(daoId) {
  const response = await client.getObject({
    id: daoId,
    options: { showContent: true }
  });

  const daoContent = response.data.content.fields;
  console.log("DAO:", daoContent);
  return daoContent;
}

// Utwórz propozycję
async function createProposal(signer, daoId, title, description) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::create_proposal`,
    arguments: [
      tx.pure(daoId),
      tx.pure(title),
      tx.pure(description)
    ]
  });

  const result = await client.signAndExecuteTransactionBlock({
    signer,
    transactionBlock: tx,
    options: { showEffects: true },
  });

  console.log("✅ Proposal created:", result);
}

// Głosuj na propozycję
async function voteOnProposal(signer, daoId, proposalId, inFavor) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::dao::vote`,
    arguments: [
      tx.pure(daoId),
      tx.pure(proposalId),
      tx.pure(inFavor)
    ]
  });

  const result = await client.signAndExecuteTransactionBlock({
    signer,
    transactionBlock: tx,
    options: { showEffects: true },
  });

  console.log("✅ Voted:", result);
}

// Symulowana analiza sentymentu
function mockSentimentAnalysis() {
  return true; // np. pozytywny sentyment
}

// Główna logika agenta
async function agentDecisionLoop(signer) {
  const dao = await getDaoState(DAO_ID);
  const proposals = dao.proposals || [];

  if (proposals.length === 0) {
    console.log("Brak propozycji.");
    return;
  }

  const latest = proposals[proposals.length - 1];
  const proposalId = parseInt(latest.fields.id);

  if (mockSentimentAnalysis()) {
    console.log(`Głosuję ZA propozycją ${proposalId}`);
    await voteOnProposal(signer, DAO_ID, proposalId, true);
  } else {
    console.log(`Głosuję PRZECIW propozycji ${proposalId}`);
    await voteOnProposal(signer, DAO_ID, proposalId, false);
  }
}

// Główne wejście
(async () => {
  // Upewnij się, że masz poprawnie załadowany klucz prywatny!
  const keypair = Ed25519Keypair.generate(); // lub załaduj z mnemonika
  await agentDecisionLoop(keypair);
})();
