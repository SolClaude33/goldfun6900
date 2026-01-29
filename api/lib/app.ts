/**
 * Express app solo con rutas públicas (para Vercel serverless).
 */
import express from "express";
import { getDistributionLogs } from "./firebase";
import { getPumpProtocolFees, getFeesConvertedToGold } from "./solana";

function getTokenCa(): string | null {
  const v = process.env.CA ?? process.env.TOKEN_CA ?? process.env.CONTRACT_ADDRESS;
  return (v && String(v).trim()) || null;
}

export function createApp() {
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
