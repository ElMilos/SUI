import express from "express";
import { getDaoState, createProposal, startVoting, inviteMember } from "./sui_client";
import { Server as IOServer } from "socket.io";

const router = express.Router();
const DAO_ID = process.env.SUI_DAO_ID;
if (!DAO_ID) {
  throw new Error("Brakuje zmiennej środowiskowej DAO_ID w pliku .env");
}

// Funkcja broadcast wysyłająca propozycje do wszystkich agentów
async function broadcastProposals(io: IOServer) {
  const dao = await getDaoState(DAO_ID as string);
  io.emit("proposals", dao.proposals);
}

// Endpoint do pobierania stanu DAO
router.get("/state", async (req, res) => {
  try {
    const dao = await getDaoState(DAO_ID as string);
    res.json(dao);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint do tworzenia propozycji
router.post("/proposal", async (req, res) => {
  const { title, description, summary } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Missing title or description" });
  }

  try {
    const digest = await createProposal(title, description);
    res.json({ digest });

    const io = req.app.get("io") as IOServer;
    await broadcastProposals(io);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint do głosowania
router.post("/vote", async (req, res) => {
  const { proposalId, voteCode, sentiment, confidence } = req.body;

  if (
    typeof proposalId !== "number" ||
    ![0, 1, 2].includes(voteCode) ||
    typeof sentiment !== "number" ||
    typeof confidence !== "number"
  ) {
    return res.status(400).json({
      error:
        "Missing or invalid vote parameters. Required: proposalId (number), voteCode (0|1|2), sentiment (number), confidence (number)",
    });
  }

  try {
    const digest = await startVoting(proposalId);
    res.json({ digest });

    const io = req.app.get("io") as IOServer;
    io.emit("new_vote", { proposalId, voteCode, sentiment, confidence }); // Wysyłanie powiadomienia do agentów
    await broadcastProposals(io);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint do zapraszania członków do DAO
router.post("/invite", async (req, res) => {
  const { newMemberAddress } = req.body;

  if (!newMemberAddress) {
    return res.status(400).json({ error: "Missing new member address" });
  }

  try {
    // Wywołanie inviteMember (zapraszanie nowego członka)
    await inviteMember(DAO_ID as string, newMemberAddress);

    res.json({ message: "Member invited successfully" });

    // Powiadomienie agentów przez WebSocket
    const io = req.app.get("io") as IOServer;
    io.emit("new_invite", { newMemberAddress });

    // Opcjonalnie - aktualizacja stanu DAO na frontendzie
    await broadcastProposals(io);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
