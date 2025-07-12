# 🧠 AI DAO Operator on SUI
**An autonomous AI agent acting as a DAO participant on the SUI blockchain — MVP in 48 hours.**

---

## 📌 Project Overview

This project introduces an intelligent AI agent that:

- **Interacts with on-chain DAO proposals**
- **Analyzes off-chain discussions**
- **Makes autonomous voting decisions**
- **Generates reports and recommendations for DAO members**

Eventually, the agent may also **submit its own proposals** and **learn from community feedback**, acting as a full DAO participant.

---

## ✅ MVP — Core Features

### 🔗 **DAO Interface (SUI)**
- Connects to a basic DAO on the SUI testnet  
- Fetches on-chain proposals and vote results

### 🗳️ **Automated Voting**
- AI votes based on simple rules (e.g., vote "yes" if >70% of off-chain sentiment is positive)

### 🌐 **Off-chain Monitoring**
- Retrieves discussion data from Discord, Twitter, or forums  
- Uses a basic sentiment analysis model (e.g., HuggingFace pipeline)

### 🧾 **Reporting**
- Generates short summaries and voting recommendations  
- Displays decisions and rationale in a web dashboard

---

## 🚀 Advanced & Innovative Features (Future Scope)

### 🧠 **Community Preference Learning**
- Learns from user reactions and adapts voting decisions

### 📝 **Proposal Initiation**
- AI agent can create new DAO proposals based on its analysis

### 📊 **Decision Impact Simulation**
- Estimates the potential outcome of decisions using historical on-chain data

---

## 🛠️ Tech Stack

| **Area**           | **Tools**                                    |
|--------------------|-----------------------------------------------|
| Blockchain         | SUI + Move                                   |
| Backend            | Python / Node.js + NLP (HuggingFace Transformers) |
| Off-chain APIs     | Discord, Twitter                             |
| Frontend           | React Dashboard                              |
| Wallet Integration | Wallet Connect (for signing votes)           |
