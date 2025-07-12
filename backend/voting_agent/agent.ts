import { execSync } from 'child_process';
import * as suiClient from '../sui/sui_client';
import path from 'path';

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
      await suiClient.voteOnProposal(proposalId, 1,score, confidence); // <- jeśli masz taką opcję
      return;
    }

    if (score >= 0.6) {
      console.log(`✅ Głosujemy ZA. Pewność: ${confidence.toFixed(2)}`);
      await suiClient.voteOnProposal(proposalId, 2 ,score, confidence); // <- jeśli masz taką opcję
    } else {
      console.log(`❌ Głosujemy PRZECIW. Pewność: ${confidence.toFixed(2)}`);
      await suiClient.voteOnProposal(proposalId, 0 ,score, confidence); // <- jeśli masz taką opcję
    }

  } catch (err: any) {
    console.error('‼️ Błąd podczas uruchamiania skryptu Pythona:', err.message || err);
  }
}

main();