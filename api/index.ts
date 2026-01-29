/**
 * Vercel serverless: todo en un solo archivo para evitar ERR_MODULE_NOT_FOUND.
 * /api/* → Express app con rutas públicas (config, stats, distribution-logs).
 */
import express from "express";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { Connection, PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

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
const PUMP_CURVE_DISCRIMINATOR = Buffer.from([0x17, 0xb7, 0xf8, 0x37, 0x60, 0xd8, 0xac, 0x60]);

function deriveBondingCurve(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.toBuffer()],
    PUMP_PROGRAM_ID
  );
  return pda;
}

function derivePumpCreatorVault(creator: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("creator-vault"), creator.toBuffer()],
    PUMP_PROGRAM_ID
  );
  return pda;
}

async function getPumpProtocolFees(tokenMintAddress: string): Promise<number> {
  try {
    const connection = new Connection(RPC, "confirmed");
    const mint = new PublicKey(tokenMintAddress);
    const bondingCurve = deriveBondingCurve(mint);
    const curveAccount = await connection.getAccountInfo(bondingCurve);
    if (!curveAccount || curveAccount.data.length < 81) return 0;
    const data = curveAccount.data;
    if (!data.subarray(0, 8).equals(PUMP_CURVE_DISCRIMINATOR)) return 0;
    const creator = new PublicKey(data.subarray(49, 81));
    const creatorVault = derivePumpCreatorVault(creator);
    const vaultInfo = await connection.getAccountInfo(creatorVault);
    if (!vaultInfo) return 0;
    const rentExempt = await connection.getMinimumBalanceForRentExemption(0);
    return Math.max(0, vaultInfo.lamports - rentExempt) / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

async function getFeesConvertedToGold(devWalletAddress: string): Promise<number> {
  try {
    const connection = new Connection(RPC, "confirmed");
    const wallet = new PublicKey(devWalletAddress);
    const goldMintStr = GOLD_MINT.toBase58();
    const sigs = await connection.getSignaturesForAddress(wallet, { limit: 500 });
    let totalGold = 0;
    for (const { signature } of sigs) {
      try {
        const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
        if (!tx?.meta?.postTokenBalances || !tx?.meta?.preTokenBalances) continue;
        const preByKey = new Map(
          (tx.meta.preTokenBalances as { mint: string; owner: string; uiTokenAmount: { uiAmount: number } }[]).map((b) => [
            `${b.mint}:${b.owner}`,
            b.uiTokenAmount?.uiAmount ?? 0,
          ])
        );
        for (const post of tx.meta.postTokenBalances as { mint: string; owner: string; uiTokenAmount: { uiAmount: number } }[]) {
          if (post.mint !== goldMintStr || post.owner !== devWalletAddress) continue;
          const pre = preByKey.get(`${post.mint}:${post.owner}`) ?? 0;
          const delta = (post.uiTokenAmount?.uiAmount ?? 0) - pre;
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

  app.get("/api/public/stats", async (_req, res) => {
    try {
      const tokenCa = getTokenCa();
      const totalProtocolFees = tokenCa ? await getPumpProtocolFees(tokenCa) : 0;
      const feesConvertedToGold = process.env.DEV_WALLET_ADDRESS
        ? await getFeesConvertedToGold(process.env.DEV_WALLET_ADDRESS)
        : 0;
      res.json({
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
      });
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
