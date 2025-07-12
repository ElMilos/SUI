import express from 'express';
import { getDaoState, createProposal, startVoting } from './sui_client';


const router = express.Router();
const DAO_ID = process.env.SUI_DAO_ID;
if (!DAO_ID) {
  throw new Error('Brakuje zmiennej środowiskowej SUI_DAO_ID w pliku .env');
}

async function broadcastProposals(io: import('socket.io').Server) {
  const dao = await getDaoState(DAO_ID as string);
  io.emit("proposals", dao.proposals);
}

router.get("/state", async (req, res) => {
  try {
    const dao = await getDaoState(DAO_ID as string);
    res.json(dao);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/proposal", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description" });
  }

  try {
    const digest = await createProposal(DAO_ID as string, title, description);
    res.json({ digest });

    const io = req.app.get('io') as import('socket.io').Server;
    await broadcastProposals(io);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/vote", async (req, res) => {
  const { proposalId, voteCode, sentiment, confidence } = req.body;
  
  if (
    typeof proposalId !== 'number' ||
    ![0, 1, 2].includes(voteCode) ||
    typeof sentiment !== 'number' ||
    typeof confidence !== 'number'
  ) {
    return res.status(400).json({
      error: 'Missing or invalid vote parameters. Required: proposalId (number), voteCode (0|1|2), sentiment (number), confidence (number)',
    });
  }

  try {
    const digest = await startVoting(DAO_ID as string, proposalId, voteCode, sentiment, confidence);
    res.json({ digest });

    const io = req.app.get('io') as import('socket.io').Server;
    await broadcastProposals(io);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
