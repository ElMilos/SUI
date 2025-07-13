import { execSync } from 'child_process';
import * as suiClient from '../sui/sui_client';
import path from 'path';
import { Server } from 'socket.io'; // Importuj Server
import http from 'http'; // Do stworzenia serwera HTTP
import fs from 'fs'; // Importuj 'fs' do zapisu wiadomości do pliku

// Stwórz serwer HTTP i Socket.io
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*', // Pozwól na połączenia z dowolnego źródła dla prostoty w development
    methods: ['GET', 'POST']
  }
});

// Nasłuchuj na ZDARZENIE POŁĄCZENIA klienta Socket.io
io.on('connection', (socket) => {
  console.log('Klient Socket.io połączony');

  socket.on('new_vote', async (data) => {
    console.log('Odebrano event new_vote od klienta Socket.io:', data); // DODAJ TEN LOG
    const { proposalId, status, messages } = data;
    console.log(`Odebrano powiadomienie o nowym głosowaniu dla propozycji ${proposalId} (status: ${status}).`);
    console.log(`Zebrane wiadomości do analizy: ${messages ? messages.length : 0}`);

    await handleNewVote(proposalId, messages || []);
  });

  socket.on('disconnect', () => {
    console.log('Klient Socket.io rozłączony');
  });
});

// Uruchom serwer Socket.io na porcie 3002 (Twój discord_agent łączy się z 3001, to jest niezgodność!)
// Zmieniam na 3001, aby były zgodne
server.listen(3002, () => { // Upewnij się, że nasłuchuje na 3002
  console.log('Serwer Socket.io nasłuchuje na porcie 3002');
});

// Funkcja do zapisu wiadomości do pliku tymczasowego
function writeMessagesToFile(messages: string[]): string {
    const filePath = path.resolve(__dirname, '../voting_agent/messages_for_sentiment.txt');
    fs.writeFileSync(filePath, messages.join('\n'));
    return filePath;
}

// Funkcja do nasłuchiwania na powiadomienie o nowym głosowaniu
// Dodano parametr `messages` do tej funkcji
async function handleNewVote(proposalId: number, messages: string[]) {
  console.log('🔍 Pobieranie opinii i analiza sentymentu dla nowego głosowania...');

  try {
    // Zapisz wiadomości do pliku, który Python może odczytać
    const messagesFilePath = writeMessagesToFile(messages);
    console.log(`Wiadomości zapisane do: ${messagesFilePath}`);

    // Wywołanie Pythona, przekazując ścieżkę do pliku z wiadomościami
    // Twój skrypt Pythona będzie musiał zostać zmodyfikowany, aby czytał z tego pliku.
    const scriptPath = path.resolve(__dirname, '../voting_agent/sentiment_pipeline.py');
    const output = execSync(`python "${scriptPath}" "${messagesFilePath}"`, { // Przekazujemy ścieżkę jako argument
      encoding: 'utf-8',
    });

    const { score, confidence } = JSON.parse(output); // Wiadomości nie są już zwracane z Pythona

    console.log(`🧠 Sentyment społeczności: ${score.toFixed(2)}`);

    const intscore = parseInt((score.toFixed(2) * 100).toString(), 10);
    const intconfidence = parseInt((confidence.toFixed(2) * 100).toString(), 10);

    if (confidence < 0.7) {
      console.log(`⚠️ Pewność analizy zbyt niska (${confidence.toFixed(2)}), wstrzymujemy się od głosu.`);
      await suiClient.voteOnProposal(proposalId, 2, intscore, intconfidence); // Głos 2 to abstain
      return;
    }

    if (score >= 0.6) {
      console.log(`✅ Głosujemy ZA. Pewność: ${confidence.toFixed(2)}`);
      await suiClient.voteOnProposal(proposalId, 0, intscore, intconfidence); // Głos 0 to yes
    } else {
      console.log(`❌ Głosujemy PRZECIW. Pewność: ${confidence.toFixed(2)}`);
      await suiClient.voteOnProposal(proposalId, 1, intscore, intconfidence); // Głos 1 to no
    }

  } catch (err: any) {
    console.error('‼️ Błąd podczas uruchamiania skryptu Pythona:', err.message || err);
  } finally {
      // Opcjonalnie: usuń plik tymczasowy po użyciu
      // fs.unlinkSync(messagesFilePath);
  }
}