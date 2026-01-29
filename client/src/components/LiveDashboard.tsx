import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, Wifi, Shield, ExternalLink, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

interface Stats {
  totalDistributions: number;
  totalGoldDistributed: number;
  totalGoldMajorHolders: number;
  totalGoldMediumHolders: number;
  totalTokenBuyback: number;
  totalFeesClaimed: number;
  totalProtocolFees: number;
  feesConvertedToGold: number;
  totalBurned: number;
  goldMint: string;
  tokenMint: string | null;
  lastDistribution: string | null;
  minimumHolderPercentage: string;
  mediumHolderMinPercentage: string;
  majorHoldersPercentage: string;
  mediumHoldersPercentage: string;
  buybackPercentage: string;
  goldDistributionPercentage: string;
  burnPercentage: string;
}

interface DistributionLogEntry {
  id: string;
  transaction: string;
  goldDistributed: number;
  date: string;
}

/** Format so small values like 0.000014 show (not 0.0000). */
function formatSmall(value: number, minDecimals: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0." + "0".repeat(minDecimals);
  const decimals = n > 0 && n < 0.0001 ? 8 : minDecimals;
  return n.toFixed(decimals);
}

export function LiveDashboard() {
  const [countdown, setCountdown] = useState<string>("");

  const { data: stats } = useQuery<Stats>({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await fetch("/api/public/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: distributionLogs = [] } = useQuery<DistributionLogEntry[]>({
    queryKey: ["public-distribution-logs"],
    queryFn: async () => {
      const res = await fetch("/api/public/distribution-logs");
      if (!res.ok) throw new Error("Failed to fetch distribution logs");
      return res.json();
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!stats?.tokenMint) return;

    const updateCountdown = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const minutesLeft = 59 - minutes;
      const secondsLeft = 59 - seconds;
      setCountdown(`${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats?.tokenMint]);

  const solscanUrl = (signature: string) => `https://solscan.io/tx/${signature}`;
  
  const isLive = !!stats?.tokenMint;

  return (
    <section id="dashboard" className="py-12 bg-white dark:bg-black font-mono text-green-700 dark:text-green-500 border-y-2 border-black dark:border-green-900/30 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        <div className="bg-gray-50 dark:bg-[#0a0a0a] border-2 dark:border border-b-0 border-black dark:border-green-900/50 rounded-t-lg p-3 flex justify-between items-center select-none shadow-sm dark:shadow-[0_0_20px_rgba(0,255,0,0.05)] transition-colors duration-300">
          <div className="flex items-center gap-4 text-xs">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500 border border-red-700 dark:border-red-500 dark:bg-red-500/20"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-700 dark:border-yellow-500 dark:bg-yellow-500/20"></div>
               <div className="w-3 h-3 rounded-full bg-green-500 border border-green-700 dark:border-green-500 dark:bg-green-500/20"></div>
             </div>
             <span className="text-black dark:text-green-500 font-bold">GOLDFUNX_MONITOR_V2.1</span>
          </div>
          <div className="flex gap-4 text-[10px] md:text-xs text-green-800 dark:text-green-600 uppercase tracking-wider font-bold">
             {isLive && countdown && (
               <span className="flex items-center gap-1 text-metal-gold">
                 <Clock className="w-3 h-3" /> Next: {countdown}
               </span>
             )}
             <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> CONNECTED</span>
             <span className="flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse" /> LIVE FEED</span>
             <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SECURE</span>
          </div>
        </div>

        <div className="bg-white dark:bg-black border-2 dark:border border-black dark:border-green-900/50 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none transition-colors duration-300">
          
          <div className="lg:col-span-4 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r-2 dark:lg:border-r border-gray-200 dark:border-green-900/30 pb-6 lg:pb-0 lg:pr-6">
            
            <div className="space-y-2">
              <h3 className="text-black dark:text-green-700 text-xs uppercase tracking-widest mb-1 font-bold">Total Protocol Fees</h3>
              <div className="text-5xl font-black text-black dark:text-white tracking-tighter tabular-nums" data-testid="text-total-fees">
                {formatSmall((stats?.totalProtocolFees ?? 0), 6)}
              </div>
              <div className="text-xs text-black dark:text-green-600 font-bold bg-green-200 dark:bg-transparent dark:text-green-500 inline-block px-2 py-0.5 border border-black dark:border-none uppercase">
                {stats?.tokenMint ? "ACTIVE" : "PENDING"} | {stats?.goldDistributionPercentage || "70"}% → $GOLD
              </div>
            </div>

            <div className="w-full h-px bg-black dark:bg-green-900 opacity-10 dark:opacity-30" />

            <div className="space-y-2">
              <h3 className="text-black dark:text-metal-gold text-xs uppercase tracking-widest mb-1 font-bold">Fees Converted to Gold</h3>
              <div className="text-4xl font-black text-black dark:text-metal-gold tracking-tighter tabular-nums" data-testid="text-fees-gold">
                {formatSmall(stats?.feesConvertedToGold ?? stats?.totalGoldDistributed ?? 0, 6)} <span className="text-lg text-black/50 dark:text-metal-gold/50 font-normal">OZ</span>
              </div>
              <div className="w-full bg-white dark:bg-green-900/20 h-3 mt-2 border-2 border-black dark:border-none overflow-hidden rounded-full dark:rounded-none">
                <div className="h-full bg-metal-gold" style={{ width: `${stats?.goldDistributionPercentage || 70}%` }}></div>
              </div>
            </div>

            <div className="w-full h-px bg-black dark:bg-green-900 opacity-10 dark:opacity-30" />

            <div className="space-y-2">
              <h3 className="text-black dark:text-blue-400 text-xs uppercase tracking-widest mb-1 font-bold">Token Buybacks ({stats?.buybackPercentage || "20"}%)</h3>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter tabular-nums" data-testid="text-buyback">
                {(stats?.totalTokenBuyback || 0).toFixed(2)} GOLDFUNX
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400 font-bold bg-blue-100 dark:bg-transparent inline-block px-2 py-0.5 border border-blue-200 dark:border-none uppercase">
                {stats?.majorHoldersPercentage || "70"}% Major | {stats?.mediumHoldersPercentage || "20"}% Token Buybacks | {stats?.buybackPercentage || "20"}% Buyback
              </div>
            </div>

            <div className="mt-auto pt-6 space-y-3">
               <div className="flex justify-between text-xs text-black dark:text-green-800 font-bold uppercase items-center gap-2">
                  <span>$GOLD_CONTRACT</span>
                  <a 
                    href={`https://solscan.io/token/${stats?.goldMint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:text-metal-gold flex items-center gap-1 break-all text-right max-w-[70%]"
                  >
                    {stats?.goldMint || "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A"}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
               </div>
               <div className="flex justify-between text-xs text-black dark:text-green-800 font-bold uppercase">
                  <span>TOKEN_CA</span>
                  <span className="font-mono">
                    {stats?.tokenMint ? `...${stats.tokenMint.slice(-4)}` : "SOON"}
                  </span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 relative font-mono text-sm overflow-hidden">
             <div className="absolute top-0 right-0 flex gap-2 mb-4">
                <span className="px-2 py-1 bg-black dark:bg-green-900/20 text-white dark:text-green-500 text-[10px] rounded border border-black dark:border-green-900/50 font-bold uppercase">All Logs</span>
                <span className="px-2 py-1 bg-white dark:bg-transparent text-gray-500 dark:text-green-800 text-[10px] rounded border border-gray-300 dark:border-green-900/20 uppercase">Whales Only</span>
             </div>

             <h3 className="text-black dark:text-green-700 text-xs uppercase tracking-widest mb-4 mt-1 font-bold">&gt;_ SYSTEM_LOGS</h3>

             <div className="flex flex-col gap-2">
               {distributionLogs.length === 0 ? (
                 <div className="text-center py-8 text-green-700 dark:text-green-800">
                   No distribution logs yet. Add entries in Firebase (transaction, goldDistributed, date).
                 </div>
               ) : (
                 distributionLogs.map((entry) => (
                   <motion.div
                     key={entry.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={clsx(
                       "flex items-center justify-between p-3 rounded border-2 dark:border dark:border-l-2 uppercase",
                       "bg-white dark:bg-green-950/10 hover:bg-gray-50 dark:hover:bg-green-900/10 transition-colors cursor-default shadow-sm dark:shadow-none",
                       "border-metal-gold text-black dark:text-metal-gold dark:border-metal-gold"
                     )}
                     data-testid={`log-${entry.id}`}
                   >
                     <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                       <span className="text-xs text-gray-500 dark:opacity-50 dark:text-green-400 tabular-nums font-bold">[{entry.date ? new Date(entry.date).toLocaleString("en-US", { hour12: false }) : "—"}]</span>
                       <span className="font-black tracking-wide text-metal-gold">Transaction</span>
                     </div>
                     <div className="flex items-center gap-4 flex-wrap">
                       <span className="font-bold tabular-nums text-black dark:text-green-100">
                         {entry.goldDistributed.toFixed(4)} GOLD
                       </span>
                       {entry.transaction ? (
                         <a
                           href={solscanUrl(entry.transaction)}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-xs text-gray-400 dark:opacity-50 hidden md:flex items-center gap-1 hover:text-green-500 font-mono break-all max-w-[200px]"
                         >
                           {entry.transaction.length > 16 ? `${entry.transaction.slice(0, 8)}...${entry.transaction.slice(-4)}` : entry.transaction}
                           <ExternalLink className="w-3 h-3 shrink-0" />
                         </a>
                       ) : (
                         <span className="text-xs text-gray-400 dark:opacity-30 hidden md:block font-mono">—</span>
                       )}
                     </div>
                   </motion.div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
