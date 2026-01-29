/**
 * Firebase Firestore: solo distributionLogs (para Vercel serverless).
 */
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";

const COLLECTION_LOGS = "distributionLogs";

let _db: ReturnType<typeof getFirestore> | null = null;

function getDb(): ReturnType<typeof getFirestore> | null {
  if (_db) return _db;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey } as ServiceAccount),
      });
    }
    _db = getFirestore();
    return _db;
  } catch {
    return null;
  }
}

export async function getDistributionLogs(limit = 50): Promise<{ id: string; transaction: string; goldDistributed: number; date: string }[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await db.collection(COLLECTION_LOGS).orderBy("date", "desc").limit(limit).get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        transaction: d.transaction ?? "",
        goldDistributed: Number(d.goldDistributed) ?? 0,
        date: d.date ?? "",
      };
    });
  } catch {
    return [];
  }
}
