import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

export const COLLECTION_KEYS = [
  "users",
  "products",
  "movements",
  "permits",
  "journal",
  "accounts",
  "employees",
  "attendance",
  "leaves",
  "payroll",
  "notifications",
] as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[number];

const LS_KEY = (k: CollectionKey) => `erp.${k}`;
const FS_DOC = (k: CollectionKey) => doc(db, "erp", k);

const pendingTimers = new Map<CollectionKey, ReturnType<typeof setTimeout>>();
const lastPushedAt = new Map<CollectionKey, number>();
let syncEnabled = false;

export function enableSync() {
  syncEnabled = true;
}

export async function pullAll(): Promise<boolean> {
  let foundAny = false;
  await Promise.all(
    COLLECTION_KEYS.map(async (k) => {
      try {
        const snap = await getDoc(FS_DOC(k));
        if (snap.exists()) {
          const data = snap.data() as { items?: unknown; updatedAt?: number };
          if (Array.isArray(data.items)) {
            localStorage.setItem(LS_KEY(k), JSON.stringify(data.items));
            if (typeof data.updatedAt === "number") {
              lastPushedAt.set(k, data.updatedAt);
            }
            foundAny = true;
          }
        }
      } catch (err) {
        console.warn(`[firebase-sync] pull ${k} failed`, err);
      }
    }),
  );
  return foundAny;
}

export async function pushAll(): Promise<void> {
  await Promise.all(
    COLLECTION_KEYS.map(async (k) => {
      const raw = localStorage.getItem(LS_KEY(k));
      const items = raw ? JSON.parse(raw) : [];
      const updatedAt = Date.now();
      try {
        await setDoc(FS_DOC(k), { items, updatedAt });
        lastPushedAt.set(k, updatedAt);
      } catch (err) {
        console.warn(`[firebase-sync] push ${k} failed`, err);
      }
    }),
  );
}

export function schedulePush(key: CollectionKey, value: unknown) {
  if (!syncEnabled) return;
  const existing = pendingTimers.get(key);
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    const updatedAt = Date.now();
    setDoc(FS_DOC(key), { items: value, updatedAt })
      .then(() => {
        lastPushedAt.set(key, updatedAt);
      })
      .catch((err) => console.warn(`[firebase-sync] push ${key} failed`, err));
    pendingTimers.delete(key);
  }, 500);
  pendingTimers.set(key, t);
}

export function subscribeAll() {
  COLLECTION_KEYS.forEach((k) => {
    onSnapshot(
      FS_DOC(k),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as { items?: unknown; updatedAt?: number };
        const remoteAt = data.updatedAt ?? 0;
        const localAt = lastPushedAt.get(k) ?? 0;
        if (remoteAt <= localAt) return;
        if (Array.isArray(data.items)) {
          localStorage.setItem(LS_KEY(k), JSON.stringify(data.items));
          lastPushedAt.set(k, remoteAt);
          window.dispatchEvent(new CustomEvent("erp:data-changed", { detail: { key: k } }));
        }
      },
      (err) => console.warn(`[firebase-sync] snapshot ${k} failed`, err),
    );
  });
}
