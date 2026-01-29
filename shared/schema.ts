import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const distributions = pgTable("distributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  totalFeesCollected: numeric("total_fees_collected").notNull(),
  feesForGold: numeric("fees_for_gold").notNull(),
  feesForMediumHolders: numeric("fees_for_medium_holders"),
  feesForBuyback: numeric("fees_for_buyback"),
  feesForBurn: numeric("fees_for_burn").notNull(),
  goldPurchased: numeric("gold_purchased").notNull(),
  goldForMediumHolders: numeric("gold_for_medium_holders"),
  tokenBuyback: numeric("token_buyback"),
  goldPriceAtPurchase: numeric("gold_price_at_purchase"),
  holdersCount: integer("holders_count").notNull(),
  mediumHoldersCount: integer("medium_holders_count"),
  status: text("status").notNull().default("pending"),
  txSignature: text("tx_signature"),
});

export const insertDistributionSchema = createInsertSchema(distributions).omit({
  id: true,
  timestamp: true,
});

export type InsertDistribution = z.infer<typeof insertDistributionSchema>;
export type Distribution = typeof distributions.$inferSelect;

export const holderSnapshots = pgTable("holder_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  distributionId: varchar("distribution_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  tokenBalance: numeric("token_balance").notNull(),
  percentageOfSupply: numeric("percentage_of_supply").notNull(),
  goldReceived: numeric("gold_received"),
  txSignature: text("tx_signature"),
  status: text("status").notNull().default("pending"),
});

export const insertHolderSnapshotSchema = createInsertSchema(holderSnapshots).omit({
  id: true,
});

export type InsertHolderSnapshot = z.infer<typeof insertHolderSnapshotSchema>;
export type HolderSnapshot = typeof holderSnapshots.$inferSelect;

export const protocolConfig = pgTable("protocol_config", {
  id: varchar("id").primaryKey().default("config"),
  tokenMint: text("token_mint"),
  goldMint: text("gold_mint").default("GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A"),
  creatorWallet: text("creator_wallet"),
  minimumHolderPercentage: numeric("minimum_holder_percentage").default("0.5"),
  mediumHolderMinPercentage: numeric("medium_holder_min_percentage").default("0.1"),
  majorHoldersPercentage: numeric("major_holders_percentage").default("70"),
  mediumHoldersPercentage: numeric("medium_holders_percentage").default("20"),
  buybackPercentage: numeric("buyback_percentage").default("10"),
  goldDistributionPercentage: numeric("gold_distribution_percentage").default("70"),
  burnPercentage: numeric("burn_percentage").default("30"),
  lastDistributionAt: timestamp("last_distribution_at"),
});

export const insertProtocolConfigSchema = createInsertSchema(protocolConfig).omit({
  id: true,
});

export type InsertProtocolConfig = z.infer<typeof insertProtocolConfigSchema>;
export type ProtocolConfig = typeof protocolConfig.$inferSelect;
