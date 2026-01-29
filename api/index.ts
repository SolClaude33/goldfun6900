/**
 * Vercel serverless: todo en un solo archivo para evitar ERR_MODULE_NOT_FOUND.
 * /api/* → Express app con rutas públicas (config, stats, distribution-logs).
 */
import express from "express";
import { createHash } from "crypto";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { Connection, PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { VersionedTransaction, Transaction } from "@solana/web3.js";

// --- Token CA ---
function getTokenCa(): string | null {
  const v = process.env.CA ?? process.env.TOKEN_CA ?? process.env.CONTRACT_ADDRESS;
  return (v && String(v).trim()) || null;
}

// --- Firebase (distributionLogs) ---
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

async function getDistributionLogs(limit = 50): Promise<{ id: string; transaction: string; goldDistributed: number; date: string }[]> {
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

// --- Solana (Pump.fun + GOLD) ---
const RPC = process.env.HELIUS_RPC_URL || process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const GOLD_MINT = new PublicKey("GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A");

/** Anchor: first 8 bytes of sha256("global:collect_creator_fee"). */
const COLLECT_CREATOR_FEE_DISCRIMINATOR = Buffer.from(
  createHash("sha256").update("global:collect_creator_fee").digest().subarray(0, 8)
);

const MAX_COLLECT_FEE_SIGS = 50;
const MAX_COLLECT_FEE_PARSE = 8;

/** Total SOL received by dev wallet in collect_creator_fee txs (Pump.fun). Based on dev wallet, not CA. */
async function getTotalProtocolFeesFromCollectCreatorFee(devWalletAddress: string): Promise<number> {
  try {
    const connection = new Connection(RPC, "confirmed");
    const wallet = new PublicKey(devWalletAddress);
    const walletStr = devWalletAddress;
    const sigs = await connection.getSignaturesForAddress(wallet, { limit: MAX_COLLECT_FEE_SIGS });
    let totalLamports = 0;
    const toParse = sigs.slice(0, MAX_COLLECT_FEE_PARSE);
    for (const { signature } of toParse) {
      try {
        const txResp = await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
          encoding: "base64",
        } as Parameters<Connection["getTransaction"]>[1]);
        if (!txResp?.meta || !txResp.transaction) continue;
        const raw = Buffer.from(
          typeof txResp.transaction === "string" ? txResp.transaction : (txResp.transaction as unknown as string),
          "base64"
        );
        if (raw.length < 1) continue;
        const preBalances = txResp.meta.preBalances as number[];
        const postBalances = txResp.meta.postBalances as number[];
        let accountKeys: PublicKey[] = [];
        let isCollectCreatorFee = false;
        const isVersioned = (raw[0] & 0x80) !== 0;
        if (!isVersioned) {
          const tx = Transaction.from(raw);
          const msg = tx.compileMessage();
          accountKeys = msg.accountKeys.map((k: PublicKey) => (typeof k === "string" ? new PublicKey(k) : k));
          for (const ix of msg.compiledInstructions) {
            const programId = accountKeys[ix.programIdIndex];
            if (programId?.equals(PUMP_PROGRAM_ID) && ix.data?.length >= 8) {
              const data = Buffer.from(ix.data);
              if (data.subarray(0, 8).equals(COLLECT_CREATOR_FEE_DISCRIMINATOR)) {
                isCollectCreatorFee = true;
                break;
              }
            }
          }
        } else {
          const vtx = VersionedTransaction.deserialize(new Uint8Array(raw));
          const loadedWritable = (txResp.meta as { loadedWritableAddresses?: string[] }).loadedWritableAddresses ?? [];
          const loadedReadonly = (txResp.meta as { loadedReadonlyAddresses?: string[] }).loadedReadonlyAddresses ?? [];
          const allKeys = vtx.message.getAccountKeys({
            accountKeysFromLookups: {
              writable: loadedWritable.map((a) => new PublicKey(a)),
              readonly: loadedReadonly.map((a) => new PublicKey(a)),
            },
          });
          for (const ix of vtx.message.compiledInstructions) {
            const programId = allKeys.get(ix.programIdIndex);
            if (!programId) continue;
            if (programId.equals(PUMP_PROGRAM_ID) && ix.data.length >= 8) {
              const data = Buffer.from(ix.data);
              if (data.subarray(0, 8).equals(COLLECT_CREATOR_FEE_DISCRIMINATOR)) {
                isCollectCreatorFee = true;
                break;
              }
            }
          }
          accountKeys = [];
          for (let i = 0; i < allKeys.length; i++) {
            const pk = allKeys.get(i);
            if (pk) accountKeys.push(pk);
          }
        }
        if (!isCollectCreatorFee) continue;
        const walletIndex = accountKeys.findIndex((k) => k.toBase58() === walletStr);
        if (walletIndex >= 0 && walletIndex < preBalances.length && walletIndex < postBalances.length) {
          const delta = postBalances[walletIndex] - preBalances[walletIndex];
          if (delta > 0) totalLamports += delta;
        }
      } catch {
        /**/
      }
    }
    return totalLamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

function toNum(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

/** Max RPC calls: 1 (signatures) + MAX_PARSED_TXS (parsed tx). Keep low to avoid 429/timeout. */
const MAX_SIGNATURES = 80;
const MAX_PARSED_TXS = 20;

async function getFeesConvertedToGold(devWalletAddress: string): Promise<number> {
  try {
    const connection = new Connection(RPC, "confirmed");
    const wallet = new PublicKey(devWalletAddress);
    const goldMintStr = GOLD_MINT.toBase58();
    const sigs = await connection.getSignaturesForAddress(wallet, { limit: MAX_SIGNATURES });
    let totalGold = 0;
    const toParse = sigs.slice(0, MAX_PARSED_TXS);
    for (const { signature } of toParse) {
      try {
        const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
        if (!tx?.meta?.postTokenBalances || !tx?.meta?.preTokenBalances) continue;
        const preByKey = new Map(
          (tx.meta.preTokenBalances as { mint: string; owner: string; uiTokenAmount?: { uiAmount?: number | string } }[]).map((b) => [
            `${b.mint}:${b.owner}`,
            toNum(b.uiTokenAmount?.uiAmount),
          ])
        );
        for (const post of tx.meta.postTokenBalances as { mint: string; owner: string; uiTokenAmount?: { uiAmount?: number | string } }[]) {
          if (post.mint !== goldMintStr || post.owner !== devWalletAddress) continue;
          const pre = preByKey.get(`${post.mint}:${post.owner}`) ?? 0;
          const postVal = toNum(post.uiTokenAmount?.uiAmount);
          const delta = postVal - pre;
          if (delta > 0) totalGold += delta;
        }
      } catch {
        /**/
      }
    }
    return totalGold;
  } catch {
    return 0;
  }
}

// --- Express app ---
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/api/public/config", (_req, res) => {
    try {
      res.json({ ca: getTokenCa() });
    } catch {
      res.status(500).json({ ca: null });
    }
  });

  app.get("/api/public/distribution-logs", async (_req, res) => {
    try {
      const logs = await getDistributionLogs(50);
      res.json(logs);
    } catch (err) {
      console.error("distribution-logs:", err);
      res.status(500).json({ error: "Failed to fetch distribution logs" });
    }
  });

  const STATS_CACHE_MS = 60_000;
  let statsCache: { data: Record<string, unknown>; at: number } | null = null;
  let statsInFlight: Promise<Record<string, unknown>> | null = null;

  app.get("/api/public/stats", async (_req, res) => {
    try {
      const now = Date.now();
      if (statsCache && now - statsCache.at < STATS_CACHE_MS) {
        return res.json(statsCache.data);
      }
      // Single-flight: concurrent requests share one RPC run to avoid 429
      if (!statsInFlight) {
        statsInFlight = (async () => {
          try {
            const tokenCa = getTokenCa();
            const devWallet = process.env.DEV_WALLET_ADDRESS ?? null;
            const totalProtocolFees = devWallet
              ? await getTotalProtocolFeesFromCollectCreatorFee(devWallet)
              : 0;
            const feesConvertedToGold = devWallet
              ? await getFeesConvertedToGold(devWallet)
              : 0;
            return {
              totalDistributions: 0,
              totalGoldDistributed: feesConvertedToGold,
              totalGoldMajorHolders: 0,
              totalGoldMediumHolders: 0,
              totalTokenBuyback: 0,
              totalFeesClaimed: 0,
              totalProtocolFees,
              feesConvertedToGold,
              totalBurned: 0,
              goldMint: "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A",
              tokenMint: tokenCa,
              lastDistribution: null,
              minimumHolderPercentage: "0.5",
              mediumHolderMinPercentage: "0.1",
              majorHoldersPercentage: "70",
              mediumHoldersPercentage: "20",
              buybackPercentage: "20",
              goldDistributionPercentage: "70",
              burnPercentage: "30",
            };
          } finally {
            statsInFlight = null;
          }
        })();
      }
      const data = await statsInFlight;
      statsCache = { data, at: Date.now() };
      res.json(data);
    } catch (err) {
      console.error("stats:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/public/distributions", (_req, res) => res.json([]));
  app.get("/api/public/distributions/:id", (_req, res) => res.status(404).json({ error: "Distribution not found" }));

  return app;
}

// --- Handler ---
let cached: ReturnType<typeof buildApp> | null = null;

export default async function handler(req: any, res: any) {
  if (!cached) cached = buildApp();
  return new Promise<void>((resolve, reject) => {
    const onDone = () => resolve();
    res.once("finish", onDone);
    res.once("close", onDone);
    res.on("error", reject);
    try {
      cached!(req, res);
    } catch (err) {
      reject(err);
    }
  });
}
