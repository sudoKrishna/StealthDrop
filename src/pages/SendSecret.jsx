// SendSecret.jsx
import React, { useState, useEffect } from "react";
import { Keypair, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { encryptMessageWithEphemeralKey } from "../solana/crypto";
import { motion } from "framer-motion";

export default function SendSecret({
  ciphertext,
  setCiphertext,
  ephemeralBase58,
  setEphemeralBase58,
  timer,
  setTimer,
}) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [fileBase64, setFileBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expiry, setExpiry] = useState(60);
  const [isNftClue, setIsNftClue] = useState(false);
  const [nftMint, setNftMint] = useState("");

  // Convert uploaded file → Base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is like "data:<mime>;base64,<data>"
      const full = reader.result;
      // store with metadata so we can reconstruct a download later
      setFileBase64(full);
    };
    reader.readAsDataURL(file);
  };

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0 && ciphertext) {
      setCiphertext("");
      setEphemeralBase58("");
    }
  }, [timer, ciphertext, setCiphertext, setEphemeralBase58, setTimer]);

  const handleSendSecret = async () => {
    if (!connected || !publicKey) return alert("Connect your wallet first.");
    if (!recipient || (!message && !fileBase64 && !isNftClue))
      return alert("Recipient and message/file or NFT clue required.");

    if (isNftClue && !nftMint) return alert("Please provide the NFT mint address for NFT Clue Mode.");

    setLoading(true);
    try {
      // ephemeral keypair (we'll use symmetric encryption key derived from ephemeral secretKey)
      const ephemeralKey = Keypair.generate();
      const secretKey32 = ephemeralKey.secretKey.slice(0, 32);

      // Build payload: include message, optional file (base64 dataURI), optional nftMint
      const payload = {
        message: message || "",
        file: fileBase64 || null, // full data URL (includes mime)
        nftMint: isNftClue ? nftMint.trim() : null,
      };

      const payloadStr = JSON.stringify(payload);
      const ct = encryptMessageWithEphemeralKey(payloadStr, secretKey32);

      // We encode the secret key for the sender to share with recipient. (Alternative: send ephemeralPublic instead for asymmetric)
      const ephemeralB58 = bs58.encode(secretKey32);

      // send zero-lamport tx to recipient (notification). Keep same flow as before.
      const recipientPubkey = new PublicKey(recipient);
      const instruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports: 0,
      });

      const tx = new Transaction().add(instruction);
      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = blockhash;

      // Ask wallet to sign and send
      const signedTx = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(sig);

      // Save ciphertext + ephemeral key to app state (so it persists across pages)
      setCiphertext(ct);
      setEphemeralBase58(ephemeralB58);
      setTimer(expiry);

      alert(`Transaction Confirmed!\nSignature: ${sig}\nShare the ciphertext + ephemeral key with recipient.`);
    } catch (err) {
      console.error("SendTransactionError:", err);
      alert("Transaction failed: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col justify-center items-center bg-white text-black px-6 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-black">📤 Send Secret</h2>
        {!connected && <p className="text-gray-500 mb-4">Please connect your wallet above.</p>}

        <div className="flex flex-col gap-3 text-left mb-4">
          <input
            placeholder="Recipient public key"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Secret message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Attach a small file (optional)</label>
            <input type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" onChange={handleFileUpload} />
            {fileBase64 && <p className="text-xs text-gray-500 mt-1">File loaded (will be encrypted).</p>}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input id="nftClue" type="checkbox" checked={isNftClue} onChange={() => setIsNftClue((v) => !v)} />
            <label htmlFor="nftClue" className="text-sm">Enable NFT Clue Mode (hide an NFT mint)</label>
          </div>

          {isNftClue && (
            <input
              placeholder="NFT mint address (e.g. mint public key)"
              value={nftMint}
              onChange={(e) => setNftMint(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <label className="text-gray-700 text-sm">Secret expiry time</label>
            <select value={expiry} onChange={(e) => setExpiry(Number(e.target.value))} className="border px-3 py-2 rounded-lg text-sm">
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={3600}>1 hour</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSendSecret}
          disabled={loading || !connected}
          className={`w-full py-3 rounded-full text-white font-medium transition-all duration-200 ${
            !connected || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Encrypting & Sending..." : "🚀 Send Secret"}
        </button>

        {ciphertext && (
          <motion.div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-2">
              <strong className="text-blue-700">Secret ready — auto-hides in {timer}s</strong>
            </div>
            <textarea readOnly value={ciphertext} className="w-full h-20 px-3 py-2 border rounded-md mb-2" />
            <input readOnly value={ephemeralBase58} className="w-full px-3 py-2 border rounded-md mb-2" />
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(ciphertext)} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Copy Ciphertext</button>
              <button onClick={() => copyToClipboard(ephemeralBase58)} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Copy Ephemeral Key</button>
            </div>
            {isNftClue && nftMint && <p className="text-xs text-gray-600 mt-2">NFT Clue: {nftMint}</p>}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
