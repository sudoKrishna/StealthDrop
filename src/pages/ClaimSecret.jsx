import React, { useState, useEffect } from "react";
import bs58 from "bs58";
import { decryptMessageWithSymmetricKey } from "../solana/crypto";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon, CopyIcon, Loader2Icon } from "lucide-react";

/* -------------------- TOAST COMPONENT -------------------- */
function Toast({ id, type, title, message, onClose }) {
  const colorMap = {
    success: {
      bg: "bg-green-50 border-green-300 text-green-800",
      icon: <CheckCircle2Icon className="h-5 w-5 mt-1" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-300 text-blue-800",
      icon: <PopcornIcon className="h-5 w-5 mt-1" />,
    },
    error: {
      bg: "bg-red-50 border-red-300 text-red-800",
      icon: <AlertCircleIcon className="h-5 w-5 mt-1" />,
    },
  };
  const { bg, icon } = colorMap[type] || colorMap.info;

  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(t);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 border rounded-lg shadow-lg p-4 mb-3 w-80 ${bg}`}
    >
      {icon}
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>
    </motion.div>
  );
}

/* -------------------- MAIN COMPONENT -------------------- */
export default function ClaimSecret({ ciphertext, setCiphertext, ephemeralKey, setEphemeralKey }) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();

  const [plaintext, setPlaintext] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [nftMint, setNftMint] = useState(null);
  const [ownershipVerified, setOwnershipVerified] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(false);
  const [toasts, setToasts] = useState([]);

  /* --- Toast Manager --- */
  const showToast = (type, title, message = "") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleDecrypt = () => {
    if (!connected) return showToast("error", "Wallet Not Connected", "Please connect your wallet first.");
    if (!ciphertext || !ephemeralKey) return showToast("info", "Missing Data", "Ciphertext and ephemeral key required.");

    try {
      let keyBytes = bs58.decode(ephemeralKey);
      if (keyBytes.length === 64) keyBytes = keyBytes.slice(0, 32);

      const decrypted = decryptMessageWithSymmetricKey(ciphertext, keyBytes);
      const data = JSON.parse(decrypted);

      setPlaintext(data.message || "");
      setFileDataUrl(data.file || null);
      setNftMint(data.nftMint || null);

      showToast("success", "Decrypted Successfully", "Your secret has been decrypted.");
    } catch (err) {
      console.error(err);
      showToast("error", "Decryption Failed", err?.message || String(err));
    }
  };

  const downloadFile = () => {
    if (!fileDataUrl) return;
    const [meta, b64data] = fileDataUrl.split(",");
    const mime = meta.match(/:(.*?);/)[1];
    const bstr = atob(b64data);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    const blob = new Blob([u8arr], { type: mime });
    const url = URL.createObjectURL(blob);
    const ext = mime.split("/")[1] || "bin";
    const a = document.createElement("a");
    a.href = url;
    a.download = `secret_file.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "File Downloaded", "Your attached file has been downloaded.");
  };

  const verifyOwnership = async () => {
    if (!connected || !publicKey || !nftMint) return showToast("info", "Missing Info", "Connect wallet and ensure NFT mint is present.");
    setCheckingOwnership(true);
    setOwnershipVerified(false);
    try {
      const mintPubkey = new PublicKey(nftMint);
      const resp = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: mintPubkey });
      const has = resp.value.some((acc) => Number(acc.account.data.parsed.info.tokenAmount.uiAmount || 0) > 0);
      setOwnershipVerified(has);
      if (has) showToast("success", "Ownership Verified", "You own the NFT mint specified in this clue.");
      else showToast("error", "Ownership Missing", "You do not own the NFT mint specified.");
    } catch (err) {
      console.error(err);
      showToast("error", "Verification Failed", err?.message || String(err));
    } finally {
      setCheckingOwnership(false);
    }
  };

  const claimReward = async () => {
    if (!ownershipVerified) return showToast("info", "Cannot Claim", "Verify NFT ownership first.");
    showToast("success", "Claim Action", `Claim action fired for mint ${nftMint} and wallet ${publicKey?.toBase58()}.`);
    // TODO: Implement on-chain claim logic
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast("success", `${label} Copied!`);
  };

  return (
    <>
      {/* ---------- Toasts ---------- */}
      <div className="fixed top-5 right-5 z-50 flex flex-col items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="min-h-screen w-full flex justify-center items-start sm:items-center bg-white text-black px-4 sm:px-6 lg:px-10 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">🔓 Claim Secret</h2>

          <textarea
            placeholder="Ciphertext"
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            className="w-full h-28 px-4 py-3 border rounded-md mb-4 text-sm sm:text-base resize-none"
          />
          <input
            placeholder="Ephemeral Key"
            value={ephemeralKey}
            onChange={(e) => setEphemeralKey(e.target.value)}
            className="w-full px-4 py-3 border rounded-md mb-4 text-sm sm:text-base"
          />

          <button
            onClick={handleDecrypt}
            disabled={!connected}
            className={`w-full py-3 rounded-full text-white font-medium mb-4 ${!connected ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            Decrypt Secret
          </button>

          {plaintext && (
            <motion.div
              className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-3 break-words overflow-y-auto max-h-[60vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h4 className="font-semibold text-blue-700 text-lg sm:text-xl">Decrypted Message</h4>
              <p className="text-gray-800">{plaintext}</p>

              {fileDataUrl && (
                <button onClick={downloadFile} className="px-3 py-2 bg-green-600 text-white rounded-md">
                  📎 Download Attached File
                </button>
              )}

              {nftMint && (
                <div className="mt-2">
                  <p className="text-sm sm:text-base text-gray-700 mb-2">
                    🔍 NFT Clue detected: <strong>{nftMint}</strong>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={verifyOwnership}
                      disabled={checkingOwnership}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md w-full sm:w-auto"
                    >
                      {checkingOwnership ? "Checking..." : "Verify Ownership"}
                    </button>
                    <button
                      onClick={claimReward}
                      disabled={!ownershipVerified}
                      className={`px-3 py-2 rounded-md text-white w-full sm:w-auto ${
                        ownershipVerified ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Claim Reward
                    </button>
                  </div>
                  {ownershipVerified && (
                    <p className="text-xs text-green-700 mt-2">Ownership verified — you can claim the reward.</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}
