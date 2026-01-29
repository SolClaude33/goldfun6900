/**
 * Read-only Solana helpers: Pump.fun protocol fees and dev wallet GOLD volume.
 * No signing, no transactions.
 */
import { Connection, PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const RPC = process.env.HELIUS_RPC_URL || process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const PUMP_PROGRAM_ID = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
const GOLD_MINT = new PublicKey("GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A");

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

const PUMP_CURVE_DISCRIMINATOR = Buffer.from([0x17, 0xb7, 0xf8, 0x37, 0x60, 0xd8, 0xac, 0x60]);

async function getCreatorVaultBalance(connection: Connection, curveAccountData: Buffer): Promise<number> {
  if (curveAccountData.length < 81) return 0;
  const creator = new PublicKey(curveAccountData.subarray(49, 81));
  const creatorVault = derivePumpCreatorVault(creator);
  const vaultInfo = await connection.getAccountInfo(creatorVault);
  if (!vaultInfo) return 0;
  const rentExempt = await connection.getMinimumBalanceForRentExemption(0);
  return Math.max(0, vaultInfo.lamports - rentExempt) / LAMPORTS_PER_SOL;
}

/** Get Pump.fun creator vault SOL balance (protocol fees). Accepts token mint or bonding curve address. */
export async function getPumpProtocolFees(tokenMintOrCurveAddress: string): Promise<number> {
  try {
    const connection = new Connection(RPC, "confirmed");
    const mint = new PublicKey(tokenMintOrCurveAddress);
    let curveAccount = await connection.getAccountInfo(deriveBondingCurve(mint));
    if (!curveAccount) curveAccount = await connection.getAccountInfo(mint);
    if (!curveAccount?.data) return 0;
    const data = curveAccount.data;
    if (!data.subarray(0, 8).equals(PUMP_CURVE_DISCRIMINATOR)) return 0;
    return getCreatorVaultBalance(connection, data);
  } catch {
    return 0;
  }
}

function toNum(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

const MAX_SIGNATURES = 80;
const MAX_PARSED_TXS = 20;

/** Sum GOLD token received by a wallet from parsed history (limited to avoid RPC 429/timeout). */
export async function getFeesConvertedToGold(devWalletAddress: string): Promise<number> {
  try {
    const connection = new Connection(RPC, "confirmed");
    const wallet = new PublicKey(devWalletAddress);
    const goldMintStr = GOLD_MINT.toBase58();
    const sigs = await connection.getSignaturesForAddress(wallet, { limit: MAX_SIGNATURES });
    let totalGold = 0;
    const toParse = sigs.slice(0, MAX_PARSED_TXS);
    for (const { signature } of toParse) {
      try {
        const tx = await connection.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
        });
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
        // skip failed parse
      }
    }
    return totalGold;
  } catch {
    return 0;
  }
}
