/**
 * Firebase Firestore for distribution logs (Transaction, Gold distributed, Date).
 * Edit manually in Firebase Console. App only reads.
 */
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";

const COLLECTION = "distributionLogs";

export interface DistributionLogEntry {
  id: string;
  transaction: string;
  goldDistributed: number;
  date: string;
}

let _db: ReturnType<typeof getFirestore> | null = null;

function getDb(): ReturnType<typeof getFirestore> | null {
  if (_db) return _db;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.log("[Firebase] Not configured (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Distribution logs will be empty.");
    return null;
  }
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey } as ServiceAccount),
      });
    }
    _db = getFirestore();
    return _db;
  } catch (e) {
    console.error("[Firebase] Init error:", e);
    return null;
  }
}

/** Get distribution logs from Firestore, sorted by date descending. */
export async function getDistributionLogs(limit = 50): Promise<DistributionLogEntry[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await db
      .collection(COLLECTION)
      .orderBy("date", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        transaction: d.transaction ?? "",
        goldDistributed: Number(d.goldDistributed) ?? 0,
        date: d.date ?? "",
      };
    });
  } catch (e) {
    console.error("[Firebase] getDistributionLogs error:", e);
    return [];
  }
}
