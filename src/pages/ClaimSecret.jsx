// ClaimSecret.jsx
import React, { useState } from "react";
import bs58 from "bs58";
import { decryptMessageWithSymmetricKey } from "../solana/crypto";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { PublicKey } from "@solana/web3.js";

export default function ClaimSecret({
  ciphertext,
  setCiphertext,
  ephemeralKey,
  setEphemeralKey,
}) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();

  const [plaintext, setPlaintext] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [nftMint, setNftMint] = useState(null);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(false);

  const handleDecrypt = () => {
    if (!connected) return alert("Connect your wallet first.");
    if (!ciphertext || !ephemeralKey) return alert("Ciphertext and ephemeral key required.");

    try {
      let keyBytes = bs58.decode(ephemeralKey);
      if (keyBytes.length === 64) keyBytes = keyBytes.slice(0, 32);

      const decrypted = decryptMessageWithSymmetricKey(ciphertext, keyBytes);
      // We expect payload was JSON { message, file, nftMint }
      const data = JSON.parse(decrypted);

      setPlaintext(data.message || "");
      if (data.file) {
        // data.file should be a dataURL like "data:<mime>;base64,<data>"
        setFileDataUrl(data.file);
      } else {
        setFileDataUrl(null);
      }
      if (data.nftMint) {
        setNftMint(data.nftMint);
      } else {
        setNftMint(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to decrypt: " + (err?.message || err));
    }
  };

  const downloadFile = () => {
    if (!fileDataUrl) return;
    const arr = fileDataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    const blob = new Blob([u8arr], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Infer extension from mime if possible
    const ext = mime.split("/")[1] || "bin";
    a.download = `secret_file.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Verify ownership of the NFT mint: check if connected wallet holds any token account for that mint with amount>0
  const verifyOwnership = async () => {
    if (!connected || !publicKey || !nftMint) {
      return alert("Connect wallet and ensure an NFT mint is present.");
    }
    setCheckingOwnership(true);
    setOwnershipVerified(false);
    try {
      const mintPubkey = new PublicKey(nftMint);
      // Query token accounts by owner and filter by mint
      const resp = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: mintPubkey });
      const has = resp.value.some((acc) => {
        const amount = acc.account.data.parsed.info.tokenAmount;
        // For NFTs amount.uiAmount usually === 1
        return Number(amount.uiAmount || 0) > 0;
      });
      setOwnershipVerified(has);
      if (!has) {
        alert("You do not own the NFT mint specified in this clue.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify ownership: " + (err?.message || err));
    } finally {
      setCheckingOwnership(false);
    }
  };

  // Placeholder claim action: this should be wired to your on-chain reward program or minting logic.
  // For demo: we present an action that would call your backend or Solana program.
  const claimReward = async () => {
    if (!ownershipVerified) return alert("Verify NFT ownership first.");
    // TODO: Replace with your program call to grant reward (transfer token, mint, etc.)
    // Example: call a server endpoint that mints a reward to `publicKey.toBase58()`
    alert(`Claim action fired for mint ${nftMint} and wallet ${publicKey?.toBase58()}. Implement on-chain claim logic here.`);
  };

  return (
    <motion.div className="min-h-screen w-full flex flex-col justify-center items-center bg-white text-black px-6 py-10"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">🔓 Claim Secret</h2>

        <textarea placeholder="Ciphertext" value={ciphertext} onChange={(e) => setCiphertext(e.target.value)} className="w-full h-28 px-4 py-3 border rounded-md mb-3" />
        <input placeholder="Ephemeral Key" value={ephemeralKey} onChange={(e) => setEphemeralKey(e.target.value)} className="w-full px-4 py-3 border rounded-md mb-4" />

        <button onClick={handleDecrypt} disabled={!connected} className={`w-full py-3 rounded-full text-white font-medium ${!connected ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          Decrypt Secret
        </button>

        {plaintext && (
          <motion.div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h4 className="font-semibold text-blue-700 mb-2">Decrypted Message</h4>
            <p className="text-gray-800 mb-3 break-words">{plaintext}</p>

            {fileDataUrl && (
              <div className="mb-3">
                <button onClick={downloadFile} className="px-3 py-2 bg-green-600 text-white rounded-md mr-2">📎 Download Attached File</button>
              </div>
            )}

            {nftMint && (
              <div className="mt-2">
                <p className="text-sm text-gray-700 mb-2">🔍 NFT Clue detected: <strong>{nftMint}</strong></p>
                <div className="flex gap-2">
                  <button onClick={verifyOwnership} disabled={checkingOwnership} className="px-3 py-2 bg-indigo-600 text-white rounded-md">
                    {checkingOwnership ? "Checking..." : "Verify Ownership"}
                  </button>
                  <button onClick={claimReward} disabled={!ownershipVerified} className={`px-3 py-2 rounded-md text-white ${ownershipVerified ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"}`}>
                    Claim Reward
                  </button>
                </div>
                {ownershipVerified && <p className="text-xs text-green-700 mt-2">Ownership verified — you can claim the reward.</p>}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
