import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar({ setPage }) {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Left Side - Navigation Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPage("home")}
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
        >
          🏠 Home
        </button>
        <button
          onClick={() => setPage("send")}
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
        >
          📤 Send Secret
        </button>
        <button
          onClick={() => setPage("claim")}
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
        >
          🔓 Claim Secret
        </button>
      </div>

      {/* Wallet Connect Button */}
      <div className="flex items-center">
        <WalletMultiButton className="!bg-blue-600 !text-white hover:!bg-blue-700 transition-all !rounded-full !px-5 !py-2 !text-sm !font-medium shadow-sm" />
      </div>
    </nav>
  );
}
