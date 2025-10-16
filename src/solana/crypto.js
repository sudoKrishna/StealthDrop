import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Encrypt a UTF-8 message using an ephemeral key (secretKey) with nacl.secretbox
 */
export function encryptMessageWithEphemeralKey(message, secretKey) {
  const nonce = nacl.randomBytes(24);
  const messageBytes = new TextEncoder().encode(message);
  const box = nacl.secretbox(messageBytes, nonce, secretKey);
  // return as base58 string: nonce + ciphertext
  return bs58.encode(new Uint8Array([...nonce, ...box]));
}

/**
 * Decrypt a base58-encoded message using the ephemeral key
 */
export function decryptMessageWithSymmetricKey(base58Message, secretKey) {
  const bytes = bs58.decode(base58Message);
  const nonce = bytes.slice(0, 24);
  const box = bytes.slice(24);
  const decrypted = nacl.secretbox.open(box, nonce, secretKey);
  if (!decrypted) throw new Error("Failed to decrypt message");
  return new TextDecoder().decode(decrypted);
}
