import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import SendSecret from "./pages/SendSecret";
import ClaimSecret from "./pages/ClaimSecret";
import Navbar from "./components/Navbar";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");

  // Room state
  const [roomId, setRoomId] = useState("");
  const [roomKeyBase58, setRoomKeyBase58] = useState("");

  // SendSecret state
  const [ciphertextSend, setCiphertextSend] = useState("");
  const [ephemeralSend, setEphemeralSend] = useState("");
  const [timer, setTimer] = useState(0);

  // ClaimSecret state
  const [ciphertextClaim, setCiphertextClaim] = useState("");
  const [ephemeralClaim, setEphemeralClaim] = useState("");

  // Function to go to a room
  const goToRoom = (id, key) => {
    setRoomId(id);
    setRoomKeyBase58(key);
    setPage("chat");
  };

  // On app mount, parse URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    const k = params.get("k");
    if (r && k) {
      goToRoom(r, k);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-white text-black font-sans overflow-hidden">
      <Navbar setPage={setPage} />
      <main className="h-[calc(100vh-4rem)] w-full">
        {page === "home" && <Home setPage={setPage} />}
        {page === "send" && (
          <SendSecret
            ciphertext={ciphertextSend}
            setCiphertext={setCiphertextSend}
            ephemeralBase58={ephemeralSend}
            setEphemeralBase58={setEphemeralSend}
            timer={timer}
            setTimer={setTimer}
          />
        )}
        {page === "claim" && (
          <ClaimSecret
            ciphertext={ciphertextClaim}
            setCiphertext={setCiphertextClaim}
            ephemeralKey={ephemeralClaim}
            setEphemeralKey={setEphemeralClaim}
          />
        )}
        {page === "rooms" && <RoomList goToRoom={goToRoom} />}
        {page === "chat" && (
          <RoomChat
            roomId={roomId}
            roomKeyBase58={roomKeyBase58}
            setPage={setPage}
          />
        )}
      </main>
    </div>
  );
}
