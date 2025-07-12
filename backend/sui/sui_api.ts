import express from 'express';
import { getDaoState, createProposal, startVoting, DAO_ID } from './sui_client';

const router = express.Router();

router.get('/state', async (req, res) => {
  try {
    const dao = await getDaoState(DAO_ID);
    res.json(dao);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/proposal', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Missing title or description' });
  }

  try {
    const digest = await createProposal(DAO_ID, title, description);
    res.json({ digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vote', async (req, res) => {
  const { proposalId, voteCode, sentiment, confidence } = req.body;

  // Sprawdzenie danych wejściowych
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
    await startVoting(DAO_ID, proposalId, voteCode, sentiment, confidence);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;