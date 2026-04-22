import { createMlKem768 } from 'mlkem';

export const sessionKeys = new Map<string, CryptoKey>(); // Cached keys for each conversation
let mlkemInstancePromise: Promise<Awaited<ReturnType<typeof createMlKem768>>> | null = null;

// Get MLKem instance if active or create if not
function getMlKem() {
  if (!mlkemInstancePromise) {
    mlkemInstancePromise = createMlKem768();
  }
  return mlkemInstancePromise;
}

// Find AES key of conversation given the shared secret
async function deriveAesKey(
  conversationId: string,
  sharedSecret: Uint8Array
): Promise<CryptoKey> {
  const hkdfBaseKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(sharedSecret),
    "HKDF",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32),
      info: new TextEncoder().encode(`chat:${conversationId}:aes-gcm-256`),
    },
    hkdfBaseKey,
    { name: "AES-GCM", length: 256},
    false,
    ["encrypt", "decrypt"]
  );
}

// Create ML-KEM conversation handshake for sender
export async function createKemHandshake(
  conversationId: string,
  recipientPublicKey: Uint8Array,
): Promise<{
  kemCiphertext: number[];
}> {
  const kem = await getMlKem();

  const [ciphertext, sharedSecret] = kem.encap(recipientPublicKey);
  const aesKey = await deriveAesKey(conversationId, sharedSecret);

  sessionKeys.set(conversationId, aesKey);

  return {
    kemCiphertext: Array.from(ciphertext),
  };
}

// Receive ML-KEM handshake created by sender for recipient
export async function receiveKemHandshake(
  conversationId: string,
  recipientPrivateKey: Uint8Array,
  kemCiphertext: number[]
): Promise<void> {
  const kem = await getMlKem();

  const sharedSecret = kem.decap(
    new Uint8Array(kemCiphertext),
    recipientPrivateKey
  );

  const aesKey = await deriveAesKey(conversationId, sharedSecret);
  sessionKeys.set(conversationId, aesKey);
}

// Encrypt messages before sending them
export async function encryptMessage(
  conversationId: string,
  message: string
) {
  const key = sessionKeys.get(conversationId);
  if (!key) throw new Error("No session key established for conversation");

  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector needed for AES
  const plaintext = new TextEncoder().encode(message);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
  };
};

// Decrypt received messages to be displayed in plaintext
export async function decryptMessage(
  conversationId: string,
  message: { iv: number[], data: number[] }
) {
  const key = sessionKeys.get(conversationId);
  if (!key) throw new Error("No session key established for conversation");

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(message.iv) },
    key,
    new Uint8Array(message.data)
  );

  return new TextDecoder().decode(decrypted);
};