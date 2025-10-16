import React from "react";

export default function About() {
  return (
    <div className="page">
      <h2>About StealthDrop</h2>
      <p>
        <strong>StealthDrop</strong> is a privacy-first tool built on{" "}
        <strong>Solana</strong> that allows anyone to send SOL or SPL tokens and
        encrypted messages without revealing their identity.
      </p>

      <h3>🛠 How it works</h3>
      <ul style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
        <li>
          The sender creates a <em>stealth drop</em> using an ephemeral (temporary)
          public key provided by the recipient.
        </li>
        <li>
          The message is <strong>end-to-end encrypted</strong> so only the
          intended recipient can read it.
        </li>
        <li>
          Tokens and message details are recorded on Solana in a privacy-preserving way.
        </li>
        <li>
          The recipient can later claim their tokens and decrypt the hidden message.
        </li>
      </ul>

      <h3>🚀 How to use</h3>
      <ol style={{ textAlign: "left", maxWidth: "600px", margin: "1rem auto" }}>
        <li>Connect your Phantom wallet.</li>
        <li>Go to <strong>Create Drop</strong> and paste recipient’s ephemeral public key.</li>
        <li>Enter a secret message and click <strong>Create Drop</strong>.</li>
        <li>Send the generated link or ciphertext to your recipient securely.</li>
        <li>Recipient visits <strong>Claim Drop</strong>, enters keys, and decrypts the message.</li>
      </ol>

      <p>
        🧠 <strong>Goal:</strong> Make private crypto transfers simple, fast, and
        censorship-resistant — a true Cypherpunk experience.
      </p>
    </div>
  );
}
