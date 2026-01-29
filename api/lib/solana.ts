/**
 * Read-only Solana: Pump.fun fees and dev wallet GOLD (para Vercel serverless).
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

export async function getPumpProtocolFees(tokenMintAddress: string): Promise<number> {
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

export async function getFeesConvertedToGold(devWalletAddress: string): Promise<number> {
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
