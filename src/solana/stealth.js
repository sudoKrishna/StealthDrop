import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import bs58 from "bs58";
import sha256 from "crypto-js/sha256";

export function generateKeypair() {
  const kp = nacl.box.keyPair();
  return {
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
    publicKeyBase58: bs58.encode(kp.publicKey),
    secretKeyBase58: bs58.encode(kp.secretKey),
  };
}

export function encryptMessage(message, recipientPub, senderPriv) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const msg = naclUtil.decodeUTF8(message);
  const cipher = nacl.box(msg, nonce, recipientPub, senderPriv);
  const combined = new Uint8Array(nonce.length + cipher.length);
  combined.set(nonce);
  combined.set(cipher, nonce.length);
  return bs58.encode(combined);
}

export function decryptMessage(encoded, senderPub, recipientPriv) {
  const combined = bs58.decode(encoded);
  const nonce = combined.slice(0, nacl.box.nonceLength);
  const msg = combined.slice(nacl.box.nonceLength);
  const decrypted = nacl.box.open(msg, nonce, senderPub, recipientPriv);
  if (!decrypted) throw new Error("Decryption failed");
  return naclUtil.encodeUTF8(decrypted);
}

export function pubkeyHash(pubkey) {
  return sha256(bs58.encode(pubkey)).toString();
}
