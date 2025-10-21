import React from "react";
import { motion } from "framer-motion";

export default function Home({ setPage }) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-white text-black text-center px-4 sm:px-6 lg:px-10 relative overflow-hidden">
      {/* Animated Container */}
      <motion.div
        className="max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
          StealthDrop 🔐
        </h1>

        <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">
          Send <span className="font-semibold text-black">encrypted secrets</span> or{" "}
          <span className="font-semibold text-black">private messages {" "}</span>  
          over the Solana blockchain. Only your recipient can decrypt them using a shared ephemeral key.
        </p>

        <p className="text-gray-500 mt-6 text-sm sm:text-base md:text-lg">
          🚀 Perfect for private communication, NFT clues, or hidden airdrops.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage("send")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-all duration-200"
          >
            Send a Secret
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage("claim")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full border border-black text-black hover:bg-black hover:text-white font-medium transition-all duration-200"
          >
            Claim a Secret
          </motion.button>
        </div>
      </motion.div>

      {/* Subtle floating accent */}
      <motion.div
        className="absolute bottom-10 w-16 sm:w-20 lg:w-24 h-[1px] bg-gray-300 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      />
    </div>
  );
}
