import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar({ setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Side - Navigation Buttons */}
          <div className="flex items-center">
            <div className="flex-shrink-0 font-bold text-lg">🔐 StealthDrop</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
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
            <WalletMultiButton className="!bg-blue-600 !text-white hover:!bg-blue-700 transition-all !rounded-full !px-5 !py-2 !text-sm !font-medium shadow-sm" />
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <WalletMultiButton className="!bg-blue-600 !text-white hover:!bg-blue-700 transition-all !rounded-full !px-3 !py-1 !text-sm !font-medium shadow-sm mr-2" />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-800 hover:text-gray-600 focus:outline-none"
            >
              {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <button
            onClick={() => {
              setPage("home");
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
          >
            🏠 Home
          </button>
          <button
            onClick={() => {
              setPage("send");
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
          >
            📤 Send Secret
          </button>
          <button
            onClick={() => {
              setPage("claim");
              setMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all"
          >
            🔓 Claim Secret
          </button>
        </div>
      )}
    </nav>
  );
}
