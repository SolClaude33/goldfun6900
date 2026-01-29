import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Play } from "lucide-react";
import fedPrinter from "@assets/generated_images/fed_money_printer_glitch_art.png";
import newsOverlay from "@assets/generated_images/gold_bull_market_tv_news.png";
import vaultImg from "@assets/generated_images/cyberpunk_gold_vault.png";

export function NewsSection() {
  const videos = [
    {
      title: "THE CRASH IS HERE",
      duration: "0:45",
      views: "1.2M Views"
    },
    {
      title: "WHY GOLD? WHY NOW?",
      duration: "2:20",
      views: "850K Views"
    },
    {
      title: "GOLDFUNX6900 EXPLAINED",
      duration: "1:15",
      views: "2.5M Views"
    }
  ];

  return (
    <section className="py-24 bg-background text-foreground border-y-4 border-border transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-border pb-6 mb-12">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] text-foreground">
            THE GOLD<br/>TIMES
          </h2>
          <div className="text-right font-mono font-bold mt-4 md:mt-0 text-foreground">
             <p>VOL. 69</p>
             <p className="bg-foreground text-background inline-block px-2">EDITION: END GAME</p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Main Story */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="border-b-2 border-border pb-8"
            >
              <div className="bg-destructive text-destructive-foreground inline-block px-3 py-1 font-bold text-sm mb-4 uppercase tracking-wider animate-pulse">
                Breaking News
              </div>
              <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-4 hover:text-metal-gold transition-colors cursor-pointer text-foreground">
                <a href="https://www.bloomberg.com/news/articles/2025-12-25/silver-rises-to-record-gold-near-all-time-high-as-risks-persist" target="_blank" rel="noopener noreferrer">
                  THOUSANDS WAKING UP TO THE REALITY: FIAT IS WORTH ZERO
                </a>
              </h3>
              <p className="text-xl md:text-2xl font-serif text-muted-foreground leading-relaxed mb-6">
                In a moment of awakening that could redefine global finance, millions are realizing that green paper is just paper. GoldFunX6900 represents the paradigm shift back to hard assets, but with the speed of Solana.
              </p>
              
              <div className="relative aspect-video w-full bg-card overflow-hidden group border-2 border-border shadow-[8px_8px_0px_0px_var(--color-border)] dark:shadow-none">
                <img 
                  src={fedPrinter} 
                  alt="Fed Printer Glitch" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8 text-foreground">
            
            <div className="border-2 border-border p-6 bg-metal-gold text-black">
               <h4 className="font-black text-2xl mb-4 uppercase">Must Read</h4>
               <ul className="space-y-4 font-bold font-mono text-sm">
                 <li className="flex items-center gap-2 hover:underline cursor-pointer">
                   <ArrowRight className="w-4 h-4" /> 
                   <a href="https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-full-year-2024/central-banks" target="_blank" rel="noopener noreferrer">THE SECRET TO LIFE IS GOLD</a>
                 </li>
                 <li className="flex items-center gap-2 hover:underline cursor-pointer">
                   <ArrowRight className="w-4 h-4" /> 
                   <a href="https://www.morganstanley.com/insights/articles/us-dollar-declines" target="_blank" rel="noopener noreferrer">5 REASONS TO DUMP USD</a>
                 </li>
                 <li className="flex items-center gap-2 hover:underline cursor-pointer">
                   <ArrowRight className="w-4 h-4" /> 
                   <a href="https://portalbridge.com/" target="_blank" rel="noopener noreferrer">HOW TO BRIDGE TO SOLANA</a>
                 </li>
                 <li className="flex items-center gap-2 hover:underline cursor-pointer">
                   <ArrowRight className="w-4 h-4" /> 
                   <a href="https://www.investopedia.com/tech/cryptocurrency-burning-can-it-manage-inflation/" target="_blank" rel="noopener noreferrer">EXPLAINER: THE BURN</a>
                 </li>
               </ul>
            </div>

            <div className="bg-card text-card-foreground p-6 border-2 border-border shadow-[8px_8px_0px_0px_var(--color-border)] dark:shadow-[0_0_15px_var(--color-primary)]">
               <h4 className="text-metal-gold font-bold text-xl mb-4 flex items-center gap-2">
                 <PlayCircle /> WATCH LIVE
               </h4>
               <div className="aspect-square bg-muted mb-4 relative overflow-hidden group cursor-pointer border border-border">
                 <img src={newsOverlay} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                     <PlayCircle className="w-8 h-8 text-white fill-current" />
                   </div>
                 </div>
               </div>
               <p className="font-mono text-sm text-muted-foreground mb-2">NOW PLAYING:</p>
               <p className="font-bold text-lg leading-tight">"WE ARE SO BACK" - THE GOLDFUNX DOCUMENTARY</p>
            </div>

          </div>
        </div>

        {/* Full Width Metal TV Section */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-end border-b-2 border-border pb-2">
             <div>
               <h4 className="font-bold text-3xl uppercase text-destructive">GOLD TV</h4>
               <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Live Coverage</p>
             </div>
             <div className="flex items-center gap-2">
               <span className="animate-pulse w-3 h-3 bg-red-600 rounded-full"></span>
               <span className="font-bold text-red-600 uppercase">On Air</span>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Video 1 */}
              <div className="group">
                <div className="relative w-full aspect-video border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] mb-3 overflow-hidden bg-black">
                   <iframe 
                    src="https://www.youtube.com/embed/OzjYNVJwqH0" 
                    title="WSJ Gold Charts" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover"
                  ></iframe>
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider z-10 pointer-events-none">
                    Live
                  </div>
                </div>
                <h5 className="font-bold text-lg leading-tight group-hover:text-metal-gold transition-colors">THE CRASH IS HERE</h5>
                <p className="text-xs font-mono text-muted-foreground mt-1">WSJ EXPLAINS • 1.2M VIEWS</p>
              </div>

              {/* Video 2 */}
              <div className="group">
                <div className="relative w-full aspect-video border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] mb-3 overflow-hidden bg-black">
                   <iframe 
                    src="https://www.youtube.com/embed/_0pr1xnqEZI" 
                    title="Bloomberg Gold" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover"
                  ></iframe>
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider z-10 pointer-events-none">
                    Breaking
                  </div>
                </div>
                <h5 className="font-bold text-lg leading-tight group-hover:text-metal-gold transition-colors">GOLD TO THE MOON?</h5>
                <p className="text-xs font-mono text-muted-foreground mt-1">BLOOMBERG • 850K VIEWS</p>
              </div>

              {/* Video 3 */}
              <div className="group">
                <div className="relative w-full aspect-video border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] mb-3 overflow-hidden bg-black">
                   <iframe 
                    src="https://www.youtube.com/embed/mhf2pPBL8nc" 
                    title="CNBC ATH" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover"
                  ></iframe>
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider z-10 pointer-events-none">
                    Alert
                  </div>
                </div>
                <h5 className="font-bold text-lg leading-tight group-hover:text-metal-gold transition-colors">ALL TIME HIGHS</h5>
                <p className="text-xs font-mono text-muted-foreground mt-1">CNBC • 2.5M VIEWS</p>
              </div>
           </div>

           <div className="bg-metal-gold/10 border-l-4 border-metal-gold p-4 mt-8">
             <p className="font-bold text-xl uppercase italic">
               "We are literally giving you GOLD. Hold the token, get paid in real assets. Inflation is theft, GoldFunX is the vault."
             </p>
           </div>
        </div>

      </div>
    </section>
  );
}
