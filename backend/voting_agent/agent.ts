import { execSync } from 'child_process';
import * as suiClient from '../sui/sui_client';
import path from 'path';
import { io } from 'socket.io-client';

// Łączenie z serwerem WebSocket
const socket = io('http://localhost:3001');  // Upewnij się, że adres jest poprawny

// Funkcja do nasłuchiwania na powiadomienie o nowym głosowaniu
socket.on('new_vote', (data) => {
  const { proposalId, voteCode, sentiment, confidence } = data;
  
  console.log('Nowe głosowanie rozpoczęte:', data);

  // Twoja logika do głosowania
  if (confidence >= 0.7) {
    if (sentiment >= 0.6) {
      console.log(`✅ Głosujemy ZA propozycją ${proposalId}`);
      // Tu możesz wywołać funkcję głosowania
      // await suiClient.voteOnProposal(suiClient.DAO_ID, proposalId, true);
    } else {
      console.log(`❌ Głosujemy PRZECIW propozycji ${proposalId}`);
      // Tu możesz wywołać funkcję głosowania
      // await suiClient.voteOnProposal(suiClient.DAO_ID, proposalId, false);
    }
  } else {
    console.log(`⚠️ Pewność jest zbyt niska, wstrzymujemy się od głosu`);
    // Tu możesz wywołać funkcję głosowania, żeby się wstrzymać
    // await suiClient.voteOnProposal(suiClient.DAO_ID, proposalId, "abstain");
  }
});

// Funkcja główna wykonująca analizę sentymentu
async function main() {
  console.log('🔍 Pobieranie opinii i analiza sentymentu...');

  try {
    // Wywołanie Pythona (który robi fetch_messages + analyze_sentiment)
    const scriptPath = path.resolve(__dirname, '../voting_agent/sentiment_pipeline.py');
    const output = execSync(`python "${scriptPath}"`, {
      encoding: 'utf-8',
    });

    const { score, confidence, messages } = JSON.parse(output);

    console.log(`✅ Pobrano ${messages.length} wiadomości.`);
    messages.forEach((msg: string) => console.log(`- ${msg}`));
    console.log(`🧠 Sentyment społeczności: ${score.toFixed(2)}`);

    const proposalId = 0; // <- Ustaw odpowiedni ID

    if (confidence < 0.7) {
      console.log(`⚠️ Pewność analizy zbyt niska (${confidence.toFixed(2)}), wstrzymujemy się od głosu.`);
      // await suiClient.voteOnProposal(suiClient.DAO_ID, proposalId, "abstain"); // <- jeśli masz taką opcję
      return;
    }

    if (score >= 0.6) {
      console.log(`✅ Głosujemy ZA. Pewność: ${confidence.toFixed(2)}`);
      // await suiClient.voteOnProposal(suiClient.DAO_ID, proposalId, true);
    } else {
      console.log(`❌ Głosujemy PRZECIW. Pewność: ${confidence.toFixed(2)}`);
      // await suiClient.voteOnProposal(suiClient.DAO_ID, proposalId, false);
    }

  } catch (err: any) {
    console.error('‼️ Błąd podczas uruchamiania skryptu Pythona:', err.message || err);
  }
}

main();
