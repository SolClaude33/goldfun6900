import { motion } from "framer-motion";
import chartImg from "@assets/generated_images/gold_vs_dollar_chart_showing_dollar_crashing_and_gold_mooning.png";

export function Narrative() {
  return (
    <section className="py-24 bg-muted/50 text-foreground border-y-4 border-border transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative p-2 bg-card border-4 border-border shadow-[16px_16px_0px_0px_var(--color-border)] dark:shadow-[0_0_30px_rgba(255,215,0,0.1)]"
            >
               <img 
                 src={chartImg} 
                 alt="Gold vs Dollar Chart" 
                 className="relative z-10 w-full transition-all duration-500"
               />
               <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-black px-4 py-2 border-2 border-white transform -rotate-2 z-20 text-xl">
                 FIAT COLLAPSE IMMINENT
               </div>
            </motion.div>
          </div>

          <div className="w-full md:w-1/2 space-y-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black uppercase leading-[0.8] text-foreground"
            >
              Why We<br/>Are Here
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-foreground text-xl leading-relaxed font-serif"
            >
              <p>
                <strong className="bg-metal-gold text-black px-1 border border-border">Gold hit $4,530.</strong> This isn't just a number. It's a signal. The signal that the 50-year experiment of fiat currency is coming to an end.
              </p>
              <p>
                Governments are printing trillions. Your purchasing power is being stolen every second you hold cash. They call it "Quantitative Easing". We call it theft.
              </p>
              <p>
                <strong className="bg-foreground text-background px-1">GoldFunX6900</strong> is the answer. We don't just meme about wealth. We capture it. By automatically converting fees into REAL tokenized Gold on the blockchain, we build a floor that cannot be rugged.
              </p>
            </motion.div>

            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="grid grid-cols-2 gap-4"
            >
              <div className="bg-card p-6 border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)] dark:shadow-none">
                <h4 className="font-black text-xl mb-1 uppercase text-foreground">SAFE HAVEN</h4>
                <p className="text-sm font-serif text-muted-foreground">Historically proven for 5,000 years.</p>
              </div>
              <div className="bg-destructive text-destructive-foreground p-6 border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)] dark:shadow-none">
                <h4 className="font-black text-xl mb-1 uppercase">ANTI-INFLATION</h4>
                <p className="text-sm font-serif opacity-90">The only hedge that matters.</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
