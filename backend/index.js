const { getAllProposals } = require('./daoService');

async function main() {
  const proposals = await getAllProposals();
  console.log('Propozycje DAO:', proposals);
}

main().catch(console.error);