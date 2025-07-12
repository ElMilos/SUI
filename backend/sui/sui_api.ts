import express from "express";
import {
  getDaoState,
  createProposal,
  voteOnProposal,
  DAO_ID,
} from "./sui_client";

const router = express.Router();

router.get("/state", async (req, res) => {
  try {
    const dao = await getDaoState(DAO_ID);
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
    const digest = await createProposal(DAO_ID, title, description);
    res.json({ digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/vote", async (req, res) => {
  const { proposalId, inFavor } = req.body;
  if (proposalId === undefined || typeof inFavor !== "boolean") {
    return res
      .status(400)
      .json({ error: "Missing or invalid vote parameters" });
  }

  try {
    const digest = await voteOnProposal(DAO_ID, proposalId, inFavor);
    res.json({ digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
