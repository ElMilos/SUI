import { Ed25519Keypair, JsonRpcProvider, RawSigner } from '@mysten/sui';
import dotenv from 'dotenv';
dotenv.config();

const provider = new JsonRpcProvider('https://fullnode.devnet.sui.io:443');

const base64Key = process.env.SUI_PRIVATE_KEY;
const keypair = Ed25519Keypair.fromSecretKey(Buffer.from(base64Key, 'base64').slice(1));
const signer = new RawSigner(keypair, provider);

async function test() {
  const address = await signer.getAddress();
  console.log('✅ Adres portfela:', address);
}

test().catch(console.error);
