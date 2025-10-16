import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import bs58 from "bs58";

// ✅ Replace with your SolPG program ID after deployment
export const PROGRAM_ID = new PublicKey("BbAo73Nm4TeT6Jn2ny2MMAJ9vWpT5K1zM2Gx1mQ6e25r");

export const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function connectWallet() {
  const provider = window.solana;
  if (!provider?.isPhantom) throw new Error("Phantom wallet not found");
  const resp = await provider.connect();
  return new PublicKey(resp.publicKey);
}

// Simulates calling your SolPG program
export async function createDropInstruction({
  creatorPubkey,
  claimantHash,
  ciphertext,
  expiry,
}) {
  const data = new Uint8Array([
    0, // instruction index: 0 = CreateDrop
    ...bs58.decode(claimantHash.slice(0, 32)), // mock claimant hash
    ...new TextEncoder().encode(ciphertext.slice(0, 32)), // partial ciphertext
  ]);

  const [dropPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("stealthdrop"), creatorPubkey.toBuffer()],
    PROGRAM_ID
  );

  return new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: creatorPubkey,
      toPubkey: dropPda,
      lamports: 1000000,
    })
  );
}

export async function claimDropInstruction({ claimerPubkey }) {
  const data = new Uint8Array([1]); // instruction index: 1 = ClaimDrop
  return new Transaction(); // placeholder for your claim logic
}
