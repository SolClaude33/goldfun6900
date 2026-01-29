import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";
import { getPumpProtocolFees, getFeesConvertedToGold } from "./solana-read";
import { getDistributionLogs } from "./firebase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const activeSessions = new Map<string, { createdAt: number }>();
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function cleanExpiredSessions() {
  const now = Date.now();
  Array.from(activeSessions.entries()).forEach(([token, session]) => {
    if (now - session.createdAt > SESSION_DURATION) {
      activeSessions.delete(token);
    }
  });
}

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];
  const session = activeSessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  
  if (Date.now() - session.createdAt > SESSION_DURATION) {
    activeSessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  setInterval(cleanExpiredSessions, 60 * 60 * 1000);

  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body;
    
    if (!ADMIN_PASSWORD) {
      return res.status(500).json({ error: "Admin password not configured" });
    }
    
    if (password === ADMIN_PASSWORD) {
      const sessionToken = generateSessionToken();
      activeSessions.set(sessionToken, { createdAt: Date.now() });
      res.json({ success: true, token: sessionToken });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
  
  app.post("/api/admin/logout", adminAuth, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      activeSessions.delete(token);
    }
    res.json({ success: true });
  });

  app.get("/api/admin/config", adminAuth, async (req, res) => {
    try {
      let config = await storage.getProtocolConfig();
      if (!config) {
        config = await storage.updateProtocolConfig({
          goldMint: "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A",
          minimumHolderPercentage: "0.5",
          majorHoldersPercentage: "70",
          mediumHoldersPercentage: "20",
          buybackPercentage: "10",
        });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  app.patch("/api/admin/config", adminAuth, async (req, res) => {
    try {
      const config = await storage.updateProtocolConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  app.get("/api/admin/distributions", adminAuth, async (req, res) => {
    try {
      const distributions = await storage.getDistributions();
      res.json(distributions);
    } catch (error) {
      console.error("Error fetching distributions:", error);
      res.status(500).json({ error: "Failed to fetch distributions" });
    }
  });

  app.get("/api/admin/distributions/:id", adminAuth, async (req, res) => {
    try {
      const distribution = await storage.getDistribution(req.params.id);
      if (!distribution) {
        return res.status(404).json({ error: "Distribution not found" });
      }
      const snapshots = await storage.getHolderSnapshots(req.params.id);
      res.json({ distribution, snapshots });
    } catch (error) {
      console.error("Error fetching distribution:", error);
      res.status(500).json({ error: "Failed to fetch distribution" });
    }
  });

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
