const { SuiClient } = require('@mysten/sui.js/client');
const { config } = require('./config');

const client = new SuiClient({ url: config.suiRpcUrl });

async function getDAOObject() {
  const dao = await client.getObject({
    id: config.daoObjectId,
    options: {
      showContent: true,
    },
  });

  return dao;
}

async function getAllProposals() {
  const dao = await getDAOObject();
  const content = dao.data.content.fields;
  const proposals = content.proposals; // vector<Proposal>

  const results = [];

  for (const item of proposals) {
    const obj = await client.getObject({
      id: item, // ID każdego Proposal
      options: {
        showContent: true,
      },
    });

    const fields = obj.data.content.fields;
    results.push({
      id: fields.id,
      title: fields.title,
      description: fields.description,
      proposer: fields.proposer,
      votes: fields.votes,
    });
  }

  return results;
}
module.exports = { getAllProposals };
