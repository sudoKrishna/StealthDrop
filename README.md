# 🕵️‍♂️ StealthDrop — Privacy-First On-Chain Secret Sharing on Solana

> **Send encrypted messages, images, and files securely across Solana.**
>
> StealthDrop is a privacy-first content sharing protocol that lets users send **secret messages, PDFs, images, and text files** to any Solana wallet — ensuring that only the intended recipient can decrypt and view the content.

---

## 🔒 Overview

StealthDrop introduces a **new layer of privacy** to the Solana ecosystem by enabling **encrypted communication and file sharing directly on-chain**.

Each secret (message, file, or NFT clue) is encrypted with an **ephemeral symmetric key** and linked to a **stealth address (PDA)** derived from the recipient’s wallet.  
Only the holder of the target wallet can decrypt and reveal the message, creating a fully private, trustless communication channel.

---

## 🌟 Key Features

- 🧩 **Encrypted Message & File Sharing**
  - Send text, PDFs, images, or `.txt` files privately on Solana.
- 🕶️ **Stealth Addresses (PDAs)**
  - Secrets are tied to hidden addresses derived from recipient wallets.
- 🔑 **Ephemeral Encryption**
  - Each message uses a unique symmetric key, discarded after encryption.
- 🪙 **NFT-Linked Secrets (Future)**
  - Gate or unlock encrypted content via NFT ownership verification.
- ⚙️ **On-Chain Verification**
  - Built for integration with Solana programs and token extensions.
- 🧠 **Client-Side Security**
  - Encryption and decryption happen fully in the browser — no central server, no data exposure.

---

## 🧰 Tech Stack

- **Frontend:** React + Tailwind + Framer Motion  
- **Wallet Integration:** `@solana/wallet-adapter-react`  
- **Blockchain:** Solana Web3.js  
- **Crypto:** Custom AES-GCM encryption via `tweetnacl` & ephemeral keypairs  
- **Storage (optional):** IPFS or Arweave (for large files or NFT metadata)

---

## 🧭 Architecture Overview

```mermaid
flowchart LR
  A[User Encrypts Message/File] --> B[Ephemeral Key Generated]
  B --> C[Encrypted Payload Created]
  C --> D[Stored On-Chain or IPFS via PDA]
  D --> E[Recipient Wallet Connects]
  E --> F[Ownership Verified + Key Derived]
  F --> G[Decryption in Browser]
  G --> H[Secret Revealed Privately]
🚀 How It Works
🔐 Sending a Secret
Connect your wallet.

Enter a message or upload a file.

StealthDrop encrypts it using an ephemeral key.

The ciphertext + key reference are tied to a stealth address (PDA) on Solana.

The receiver can later claim and decrypt it privately.

🗝️ Claiming a Secret
Receiver connects wallet and provides ciphertext + ephemeral key.

Client verifies ownership of the stealth PDA.

Message or file is decrypted locally in the browser.

🖥️ UI Components
Component	Description
SendSecret.tsx	Encrypts message/files and generates ciphertext + keypair
ClaimSecret.tsx	Decrypts the received message or file, verifies ownership
crypto.ts	Handles symmetric key encryption/decryption
connection.ts	Solana RPC setup for transactions & PDAs

🧩 Example Use Cases
🔏 Private DAO communication

💬 Encrypted on-chain chat

🧠 Confidential airdrops or whitelists

📁 Secure document sharing

🎨 NFT-gated content drops (future)

🧠 Security Design
Client-side encryption only — no server ever sees the plaintext.

Ephemeral key generation — new keys per message, reducing attack surface.

Stealth PDAs — hide sender/receiver on-chain.

NFT verification — optional access control via token ownership.

No custodial storage — users maintain full control of their data.

🧪 Local Development
bash
Copy code
# Clone the repo
git clone https://github.com/<your-handle>/stealthdrop.git

# Navigate to project
cd stealthdrop

# Install dependencies
npm install

# Start the development server
npm run dev
Then open:
👉 http://localhost:5173
