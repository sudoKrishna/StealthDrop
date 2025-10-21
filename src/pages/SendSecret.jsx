import React, { useState, useEffect } from "react";
import { Keypair, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { encryptMessageWithEphemeralKey } from "../solana/crypto";
import { motion, AnimatePresence } from "framer-motion";
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
  const [toasts, setToasts] = useState([]);

  /* --- Toast Manager --- */
  const showToast = (type, title, message = "") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  /* --- File Upload --- */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFileBase64(reader.result);
    reader.readAsDataURL(file);
  };

  /* --- Timer Countdown --- */
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0 && ciphertext) {
      setCiphertext("");
      setEphemeralBase58("");
    }
  }, [timer, ciphertext, setCiphertext, setEphemeralBase58, setTimer]);

  /* --- Send Secret Handler --- */
  const handleSendSecret = async () => {
    if (!connected || !publicKey)
      return showToast("error", "Wallet Not Connected", "Please connect your wallet first.");

    if (!recipient || (!message && !fileBase64 && !isNftClue))
      return showToast("info", "Missing Info", "Recipient and message/file or NFT clue required.");

    if (isNftClue && !nftMint)
      return showToast("info", "NFT Clue Mode", "Provide NFT mint address.");

    setLoading(true);
    try {
      const ephemeralKey = Keypair.generate();
      const secretKey32 = ephemeralKey.secretKey.slice(0, 32);
      const payload = {
        message: message || "",
        file: fileBase64 || null,
        nftMint: isNftClue ? nftMint.trim() : null,
      };
      const payloadStr = JSON.stringify(payload);
      const ct = encryptMessageWithEphemeralKey(payloadStr, secretKey32);
      const ephemeralB58 = bs58.encode(secretKey32);

      const recipientPubkey = new PublicKey(recipient);
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: 0,
        })
      );
      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = blockhash;
      const signedTx = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(sig);

      setCiphertext(ct);
      setEphemeralBase58(ephemeralB58);
      setTimer(expiry);

      showToast("success", "Secret Encrypted", "Your ciphertext and key are ready.");
    } catch (err) {
      console.error("SendTransactionError:", err);
      showToast("error", "Transaction Failed", err?.message || String(err));
    } finally {
      setLoading(false);
    }
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

      {/* ---------- Main Layout ---------- */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-gray-800 text-center">
            🔐 Send Secret
          </h2>

          {!connected && (
            <p className="text-gray-500 mb-4 text-center">
              Please connect your wallet first.
            </p>
          )}

          <div className="flex flex-col gap-4 mb-6">
            <input
              placeholder="Recipient Public Key"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Your secret message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Optional File
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.txt"
                onChange={handleFileUpload}
                className="w-full text-sm sm:text-base"
              />
              {fileBase64 && (
                <p className="text-xs text-gray-500 mt-1">
                  File loaded & will be encrypted.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="nftClue"
                type="checkbox"
                checked={isNftClue}
                onChange={() => setIsNftClue((v) => !v)}
                className="h-4 w-4 accent-blue-600"
              />
              <label htmlFor="nftClue" className="text-sm sm:text-base text-gray-700">
                Enable NFT Clue Mode
              </label>
            </div>

            {isNftClue && (
              <input
                placeholder="NFT Mint Address"
                value={nftMint}
                onChange={(e) => setNftMint(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
              />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <label className="text-gray-700 text-sm sm:text-base">Secret Expiry</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(Number(e.target.value))}
                className="border px-3 py-2 rounded-lg text-sm sm:text-base"
              >
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={3600}>1 hour</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSendSecret}
            disabled={loading || !connected}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
              !connected || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <Loader2Icon className="animate-spin h-5 w-5" />
                Encrypting & Sending...
              </div>
            ) : (
              "🚀 Send Secret"
            )}
          </button>

          {/* ----------- Responsive Secret Display ----------- */}
          <AnimatePresence>
            {ciphertext && (
              <motion.div
                className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-left space-y-3 overflow-y-auto max-h-[60vh]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between items-center">
                  <strong className="text-blue-800 text-sm sm:text-base">
                    Secret ready — auto-hides in {timer}s
                  </strong>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Ciphertext</label>
                    <textarea
                      readOnly
                      value={ciphertext}
                      className="w-full h-24 px-3 py-2 border rounded-md text-sm sm:text-base"
                    />
                    <button
                      onClick={() => copyToClipboard(ciphertext, "Ciphertext")}
                      className="mt-1 flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                    >
                      <CopyIcon size={14} /> Copy
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-medium">Ephemeral Key</label>
                    <input
                      readOnly
                      value={ephemeralBase58}
                      className="w-full px-3 py-2 border rounded-md text-sm sm:text-base"
                    />
                    <button
                      onClick={() => copyToClipboard(ephemeralBase58, "Ephemeral Key")}
                      className="mt-1 flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                    >
                      <CopyIcon size={14} /> Copy
                    </button>
                  </div>

                  {isNftClue && nftMint && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      NFT Clue: {nftMint}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
