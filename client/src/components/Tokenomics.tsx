import { motion } from "framer-motion";
import { Coins, TrendingUp, Users, Twitter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Stats {
  totalGoldDistributed: number;
  feesConvertedToGold: number;
  totalFeesClaimed: number;
  tokenMint: string | null;
}

export function Tokenomics() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["tokenomics-stats"],
    queryFn: async () => {
      const res = await fetch("/api/public/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const totalFees = stats?.totalGoldDistributed ?? stats?.feesConvertedToGold ?? stats?.totalFeesClaimed ?? 0;

  return (
    <section className="py-24 px-4 bg-background text-foreground relative overflow-hidden border-y-4 border-border transition-colors duration-300">
      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl md:text-6xl font-black text-center mb-16 uppercase tracking-tight">
          Protocol Mechanics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Major Holders Card */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-metal-gold border-4 border-border p-6 relative group shadow-[12px_12px_0px_0px_var(--color-border)] hover:shadow-[16px_16px_0px_0px_var(--color-border)] transition-all"
          >
            <div className="relative z-10 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-4 border-4 border-white">
                <Coins className="w-10 h-10 text-metal-gold" />
              </div>
              <h3 className="text-2xl font-black text-black mb-2 uppercase">Gold Dividends</h3>
              <div className="text-5xl font-black text-white mb-3 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">70%</div>
              <p className="text-black font-serif font-bold text-base leading-relaxed border-y-2 border-black py-3 mb-3">
                Creator fees converted to tokenized gold and distributed hourly to major holders.
              </p>
              <div className="mt-auto pt-3 w-full">
                 <div className="w-full bg-white h-3 mt-2 border-2 border-black overflow-hidden relative">
                   <div className="h-full bg-black w-[70%]" />
                 </div>
                 <p className="text-[10px] text-right mt-2 text-black font-mono font-bold uppercase">Holders with 0.5%+ supply</p>
              </div>
            </div>
          </motion.div>

          {/* Token Buybacks Card (was Medium Holders 20%) */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-zinc-800 border-4 border-border p-6 relative group shadow-[12px_12px_0px_0px_var(--color-border)] hover:shadow-[16px_16px_0px_0px_var(--color-border)] transition-all"
          >
            <div className="relative z-10 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-metal-gold rounded-full flex items-center justify-center mb-4 border-4 border-zinc-600">
                <Users className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-black text-metal-gold mb-2 uppercase">Token Buybacks</h3>
              <div className="text-5xl font-black text-white mb-3 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">20%</div>
              <p className="text-zinc-300 font-serif font-bold text-base leading-relaxed border-y-2 border-zinc-600 py-3 mb-3">
                Creator fees used to buy GoldFunX from the market, supporting the token price.
              </p>
              <div className="mt-auto pt-3 w-full">
                 <div className="w-full bg-zinc-700 h-3 mt-2 border-2 border-zinc-600 overflow-hidden relative">
                   <div className="h-full bg-metal-gold w-[20%]" />
                 </div>
                 <p className="text-[10px] text-right mt-2 text-zinc-400 font-mono font-bold uppercase">Price support mechanism</p>
              </div>
            </div>
          </motion.div>

          {/* Gold Vault Card (was 10% Token Buyback) */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="bg-card border-4 border-border p-6 relative group shadow-[12px_12px_0px_0px_var(--color-border)] hover:shadow-[16px_16px_0px_0px_var(--color-border)] transition-all"
          >
            <div className="relative z-10 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 border-4 border-border">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2 uppercase">Gold Vault</h3>
              <div className="text-5xl font-black text-green-600 mb-3 drop-shadow-[2px_2px_0px_var(--color-border)]">10%</div>
              <p className="text-foreground font-serif font-bold text-base leading-relaxed border-y-2 border-border py-3 mb-3">
                A value reserve for the project. Stores protocol-owned liquidity and backs long-term growth.
              </p>
              <div className="mt-auto pt-3 w-full">
                 <div className="w-full bg-muted h-3 mt-2 border-2 border-border overflow-hidden relative">
                   <div className="h-full bg-green-600 w-[10%]" />
                 </div>
                 <p className="text-[10px] text-right mt-2 text-green-600 font-mono font-bold uppercase">Value reserve</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16 text-center border-t-4 border-border pt-8 max-w-2xl mx-auto">
            <p className="text-xl font-mono text-foreground mb-4 font-bold bg-metal-gold text-black inline-block px-4 py-1 border-2 border-black">
              Total fees distributed: {totalFees.toFixed(4)} GOLD
            </p>
            <p className="text-sm text-muted-foreground font-serif italic mb-6">
                {stats?.tokenMint 
                  ? "Distributions are automatic and hourly. No staking required. No claiming required. Just hold in your wallet."
                  : "Distributions will begin automatically when the token launches. No staking required."}
            </p>
            <a 
              href="https://x.com/goldfunx6900" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors border-2 border-border"
              data-testid="link-twitter"
            >
              <Twitter className="w-5 h-5" />
              Follow on X
            </a>
        </div>
      </div>
    </section>
  );
}
