import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getPumpProtocolFees, getFeesConvertedToGold } from "./solana-read";
import { getDistributionLogs } from "./firebase";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/public/config", (_req, res) => {
    res.json({ ca: process.env.CA || null });
  });

  app.get("/api/public/distribution-logs", async (_req, res) => {
    try {
      const logs = await getDistributionLogs(50);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching distribution logs:", error);
      res.status(500).json({ error: "Failed to fetch distribution logs" });
    }
  });

  app.get("/api/public/stats", async (req, res) => {
    try {
      const distributions = await storage.getDistributions(100);
      const config = await storage.getProtocolConfig();
      const tokenCa = process.env.CA || config?.tokenMint || null;

      const totalGoldMajorHolders = distributions.reduce((sum, d) =>
        sum + parseFloat(d.goldPurchased || "0"), 0
      );
      const totalGoldMediumHolders = distributions.reduce((sum, d) =>
        sum + parseFloat(d.goldForMediumHolders || "0"), 0
      );
      const totalGoldDistributed = totalGoldMajorHolders + totalGoldMediumHolders;
      const totalTokenBuyback = distributions.reduce((sum, d) =>
        sum + parseFloat(d.tokenBuyback || "0"), 0
      );
      const totalFeesClaimed = distributions.reduce((sum, d) =>
        sum + parseFloat(d.totalFeesCollected || "0"), 0
      );
      const totalBurned = distributions.reduce((sum, d) =>
        sum + parseFloat(d.feesForBurn || "0"), 0
      );

      const totalProtocolFees = tokenCa ? await getPumpProtocolFees(tokenCa) : 0;
      const feesConvertedToGold = process.env.DEV_WALLET_ADDRESS
        ? await getFeesConvertedToGold(process.env.DEV_WALLET_ADDRESS)
        : 0;

      res.json({
        totalDistributions: distributions.filter(d => d.status === "completed").length,
        totalGoldDistributed,
        totalGoldMajorHolders,
        totalGoldMediumHolders,
        totalTokenBuyback,
        totalFeesClaimed,
        totalProtocolFees,
        feesConvertedToGold,
        totalBurned,
        goldMint: config?.goldMint || "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A",
        tokenMint: tokenCa || config?.tokenMint || null,
        lastDistribution: distributions[0]?.timestamp || null,
        minimumHolderPercentage: config?.minimumHolderPercentage || "0.5",
        mediumHolderMinPercentage: config?.mediumHolderMinPercentage || "0.1",
        majorHoldersPercentage: config?.majorHoldersPercentage || "70",
        mediumHoldersPercentage: config?.mediumHoldersPercentage || "20",
        buybackPercentage: config?.buybackPercentage || "20",
        goldDistributionPercentage: config?.goldDistributionPercentage || "70",
        burnPercentage: config?.burnPercentage || "30",
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  
  app.get("/api/public/distributions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const distributions = await storage.getDistributions(limit);
      res.json(distributions.filter(d => d.status === "completed" || d.status === "pending"));
    } catch (error) {
      console.error("Error fetching distributions:", error);
      res.status(500).json({ error: "Failed to fetch distributions" });
    }
  });
  
  app.get("/api/public/distributions/:id", async (req, res) => {
    try {
      const distribution = await storage.getDistribution(req.params.id);
      if (!distribution) {
        return res.status(404).json({ error: "Distribution not found" });
      }
      const holders = await storage.getHolderSnapshots(req.params.id);
      res.json({ distribution, holders });
    } catch (error) {
      console.error("Error fetching distribution:", error);
      res.status(500).json({ error: "Failed to fetch distribution" });
    }
  });

  return httpServer;
}
