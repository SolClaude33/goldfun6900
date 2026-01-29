import { motion } from "framer-motion";

export function Manifesto() {
  return (
    <section className="py-24 bg-card text-foreground font-serif relative border-y-4 border-border transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="border-4 border-border p-8 md:p-16 bg-card shadow-[20px_20px_0px_0px_var(--color-border)] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)] relative">
          
          {/* Paper Texture Overlay (only visible in light mode really) */}
          <div className="absolute inset-0 bg-yellow-50 opacity-50 mix-blend-multiply pointer-events-none dark:opacity-0" />
          
          <div className="relative z-10">
            <div className="flex items-end justify-between mb-12 border-b-4 border-border pb-6">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-foreground">The<br/>Prophecy</h2>
              <div className="text-right font-mono font-bold text-foreground">
                 <p>DOC_ID: 6900-X</p>
                 <p className="text-destructive">CONFIDENTIAL</p>
              </div>
            </div>
            
            <div className="space-y-8 text-xl md:text-2xl leading-relaxed font-medium">
              <p>
                <span className="float-left text-7xl font-black mr-4 mt-[-10px]">T</span>he year is 2025. Gold is at $4,530. The dollar is dissolving into digital dust. The suits at Wall Street are panicking. They told you inflation was "transitory". They lied.
              </p>
              <p>
                <span className="bg-foreground text-background px-2 font-bold transform -rotate-1 inline-block">GoldFunX6900</span> isn't just a memecoin. It's an index fund for the end of the world. It's a bet on the shiny rock that has outlasted every empire in history.
              </p>
              <p>
                While other coins offer you dreams of dogs in hats, we offer you the heavy, cold, hard reality of <strong className="underline decoration-4 decoration-metal-gold">REAL GOLD</strong>. But on the blockchain. With 100x leverage on culture.
              </p>
              
              <div className="bg-muted p-8 border-l-8 border-border font-sans mt-12">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">MISSION DIRECTIVE</p>
                <ol className="list-decimal list-inside space-y-2 font-black text-2xl uppercase">
                  <li>ACCUMULATE GOLD</li>
                  <li>BURN THE SUPPLY</li>
                  <li>ASCEND</li>
                </ol>
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <button className="px-12 py-6 bg-destructive text-destructive-foreground border-4 border-border font-black text-2xl uppercase tracking-widest hover:bg-destructive/90 transition-colors shadow-[10px_10px_0px_0px_var(--color-border)] hover:shadow-[14px_14px_0px_0px_var(--color-border)] hover:-translate-y-1 transform cursor-pointer">
                Execute Order 66
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
