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

    const intscore = parseInt((sentiment.toFixed(2) * 100).toString(), 10); 
    const intconfidence = parseInt((confidence.toFixed(2) * 100).toString(), 10); 
  // Twoja logika do głosowania
  if (confidence < 0.7) {
      console.log(`⚠️ Pewność analizy zbyt niska (${confidence.toFixed(2)}), wstrzymujemy się od głosu.`);
      suiClient.voteOnProposal(proposalId, 1,intscore, intconfidence); // <- jeśli masz taką opcję
      return;
    }

    if (sentiment >= 0.6) {
      console.log(`✅ Głosujemy ZA. Pewność: ${confidence.toFixed(2)}`);
      suiClient.voteOnProposal(proposalId, 1,intscore, intconfidence); // <- jeśli masz taką opcję
    } else {
      console.log(`❌ Głosujemy PRZECIW. Pewność: ${confidence.toFixed(2)}`);
      suiClient.voteOnProposal(proposalId, 1,intscore, intconfidence); // <- jeśli masz taką opcję
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
    const intscore = parseInt((score.toFixed(2) * 100).toString(), 10); 
    const intconfidence = parseInt((score.toFixed(2) * 100).toString(), 10); 
    if (confidence < 0.7) {
      console.log(`⚠️ Pewność analizy zbyt niska (${confidence.toFixed(2)}), wstrzymujemy się od głosu.`);
      await suiClient.voteOnProposal(proposalId, 1,intscore, intconfidence); // <- jeśli masz taką opcję
      return;
    }

    if (score >= 0.6) {
      console.log(`✅ Głosujemy ZA. Pewność: ${confidence.toFixed(2)}`);
      await suiClient.voteOnProposal(proposalId, 2 ,intscore, intconfidence); // <- jeśli masz taką opcję
    } else {
      console.log(`❌ Głosujemy PRZECIW. Pewność: ${confidence.toFixed(2)}`);
      await suiClient.voteOnProposal(proposalId, 0 ,intscore, intconfidence); // <- jeśli masz taką opcję
    }

  } catch (err: any) {
    console.error('‼️ Błąd podczas uruchamiania skryptu Pythona:', err.message || err);
  }
}

main();
