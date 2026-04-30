import { createMlKem768 } from "mlkem";

type WrappedConversationKey = {
  recipientId: number;
  kemCiphertext: number[];
  encryptedConversationKey: {
    iv: number[];
    data: number[];
  };
};

type StoredKemKeyPair = {
  publicKey: number[];
  privateKey: number[];
};

type RecipientKemInfo = {
  id: number;
  publicKey: Uint8Array;
};

const DB_NAME = "locktalk-crypto";
const DB_VERSION = 1;
const KEM_KEY_STORE = "kem-keys";
const MY_KEM_KEY_ID = "my-kem-keypair";

const sessionKeys = new Map<string, CryptoKey>();

let mlkemInstancePromise: Promise<Awaited<ReturnType<typeof createMlKem768>>> | null = null;
let myKemPrivateKey: Uint8Array | null = null;
let myKemPublicKey: Uint8Array | null = null;

// Get CSRF cookie value for Django POST requests
function getCookie(name: string): string | null {
  let cookieValue = null;

  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();

      if (cookie.startsWith(name + "=")) {
        cookieValue = cookie.substring(name.length + 1);
        break;
      }
    }
  }

  return cookieValue;
}

// Get or create reusable ML-KEM instance
function getMlKem() {
  if (!mlkemInstancePromise) {
    mlkemInstancePromise = createMlKem768();
  }

  return mlkemInstancePromise;
}

// Convert Uint8Array-like values into a normal ArrayBuffer for WebCrypto
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

// Open IndexedDB database used for local crypto key storage
function openCryptoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(KEM_KEY_STORE)) {
        db.createObjectStore(KEM_KEY_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Read a value from IndexedDB
async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openCryptoDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEM_KEY_STORE, "readonly");
    const store = tx.objectStore(KEM_KEY_STORE);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

// Store a value in IndexedDB
async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openCryptoDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEM_KEY_STORE, "readwrite");
    const store = tx.objectStore(KEM_KEY_STORE);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Check whether a conversation AES key is already available in memory
export function hasConversationKey(conversationId: string): boolean {
  return sessionKeys.has(conversationId);
}

// Upload this user's public ML-KEM key to the backend
async function uploadMyKemPublicKey(publicKey: Uint8Array): Promise<void> {
  const response = await fetch("/api/me/kem-public-key/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken") || "",
    },
    body: JSON.stringify({
      public_key: Array.from(publicKey),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload public KEM key");
  }
}

// Initialize this user's persistent ML-KEM keypair
export async function initializeMyKemKeys(): Promise<void> {
  if (myKemPrivateKey && myKemPublicKey) return;

  const saved = await idbGet<StoredKemKeyPair>(MY_KEM_KEY_ID);

  if (saved) {
    myKemPublicKey = new Uint8Array(saved.publicKey);
    myKemPrivateKey = new Uint8Array(saved.privateKey);
    await uploadMyKemPublicKey(myKemPublicKey);
    return;
  }

  const kem = await getMlKem();
  const [publicKey, privateKey] = kem.generateKeyPair();

  myKemPublicKey = publicKey;
  myKemPrivateKey = privateKey;

  await idbSet(MY_KEM_KEY_ID, {
    publicKey: Array.from(publicKey),
    privateKey: Array.from(privateKey),
  });

  await uploadMyKemPublicKey(publicKey);
}

// Fetch another user's public ML-KEM key from the backend
export async function getRecipientPublicKey(userId: number): Promise<Uint8Array> {
  const response = await fetch(`/api/users/${userId}/kem-public-key/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recipient KEM public key");
  }

  const data = await response.json();

  return new Uint8Array(data.public_key);
}

// Fetch public ML-KEM keys for a list of recipients
export async function getRecipientPublicKeys(
  recipients: { id: number }[]
): Promise<RecipientKemInfo[]> {
  return Promise.all(
    recipients.map(async recipient => ({
      id: recipient.id,
      publicKey: await getRecipientPublicKey(recipient.id),
    }))
  );
}

// Generate a fresh AES-GCM key for a conversation
async function generateConversationKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export an AES-GCM conversation key as raw bytes
async function exportConversationKey(key: CryptoKey): Promise<ArrayBuffer> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return raw;
}

// Import raw conversation key bytes back into AES-GCM
async function importConversationKey(rawKey: BufferSource): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// Derive an AES wrapping key from an ML-KEM shared secret
async function deriveWrappingKey(
  conversationId: string,
  recipientId: number,
  sharedSecret: Uint8Array
): Promise<CryptoKey> {
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(sharedSecret),
    "HKDF",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(`conversation:${conversationId}`),
      info: new TextEncoder().encode(`wrap-key:recipient:${recipientId}`),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Create a group-compatible ML-KEM handshake for all recipients
export async function createKemHandshake(
  conversationId: string,
  recipients: RecipientKemInfo[]
): Promise<{
  type: "kem_handshake";
  conversationId: string;
  wrappedKeys: WrappedConversationKey[];
}> {
  if (recipients.length === 0) {
    throw new Error("Cannot create KEM handshake with no recipients");
  }

  const kem = await getMlKem();
  const conversationKey = await generateConversationKey();
  const rawConversationKey = await exportConversationKey(conversationKey);

  sessionKeys.set(conversationId, conversationKey);

  const wrappedKeys: WrappedConversationKey[] = [];

  for (const recipient of recipients) {
    const [kemCiphertext, sharedSecret] = kem.encap(recipient.publicKey);

    const wrappingKey = await deriveWrappingKey(
      conversationId,
      recipient.id,
      sharedSecret
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedConversationKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      wrappingKey,
      rawConversationKey
    );

    wrappedKeys.push({
      recipientId: recipient.id,
      kemCiphertext: Array.from(kemCiphertext),
      encryptedConversationKey: {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedConversationKey)),
      },
    });
  }

  return {
    type: "kem_handshake",
    conversationId,
    wrappedKeys,
  };
}

// Receive a KEM handshake and restore this user's conversation AES key
export async function receiveKemHandshake(
  conversationId: string,
  myUserId: number,
  wrappedKeys: WrappedConversationKey[]
): Promise<boolean> {
  const myEntry = wrappedKeys.find(key => key.recipientId === myUserId);

  if (!myEntry) {
    return false;
  }

  if (!myKemPrivateKey) {
    throw new Error("My KEM private key is not initialized");
  }

  const kem = await getMlKem();

  const sharedSecret = kem.decap(
    new Uint8Array(myEntry.kemCiphertext),
    myKemPrivateKey
  );

  const wrappingKey = await deriveWrappingKey(
    conversationId,
    myUserId,
    sharedSecret
  );

  const rawConversationKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(myEntry.encryptedConversationKey.iv),
    },
    wrappingKey,
    new Uint8Array(myEntry.encryptedConversationKey.data)
  );

  const conversationKey = await importConversationKey(rawConversationKey);
  sessionKeys.set(conversationId, conversationKey);

  return true;
}

// Restore this user's wrapped conversation key from the backend after refresh
export async function restoreConversationKey(
  conversationId: string,
  myUserId: number
): Promise<boolean> {
  if (hasConversationKey(conversationId)) {
    return true;
  }

  const response = await fetch(`/api/conversations/${conversationId}/my-key/`, {
    credentials: "include",
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  return receiveKemHandshake(
    conversationId,
    myUserId,
    data.wrappedKeys
  );
}

// Encrypt a plaintext message using the conversation AES key
export async function encryptMessage(
  conversationId: string,
  message: string
): Promise<{ iv: number[]; data: number[] }> {
  const key = sessionKeys.get(conversationId);

  if (!key) {
    throw new Error("No session key established for conversation");
  }

  const iv = crypto.getRandomValues(new Uint8Array(12));
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
}

// Decrypt a received message using the conversation AES key
export async function decryptMessage(
  conversationId: string,
  message: { iv: number[]; data: number[] }
): Promise<string> {
  const key = sessionKeys.get(conversationId);

  if (!key) {
    throw new Error("No session key established for conversation");
  }

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(message.iv),
    },
    key,
    new Uint8Array(message.data)
  );

  return new TextDecoder().decode(decrypted);
}