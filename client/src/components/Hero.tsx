import { motion } from "framer-motion";
import { Moon, Sun, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import pillImg from "@assets/image-removebg-preview_(72)_1767120438311.png";
import goldBarImg from "@assets/image_1767120867512.png";

export function Hero() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const { data: config } = useQuery<{ ca: string | null }>({
    queryKey: ["public-config"],
    queryFn: async () => {
      const res = await fetch("/api/public/config");
      if (!res.ok) throw new Error("Failed to fetch config");
      return res.json();
    },
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  };

  // Gold bar positions - dense distribution on left side
  const goldBars = [
    { top: "5%", left: "5%", size: "w-20 md:w-28", delay: 0, duration: 3 },
    { top: "8%", left: "25%", size: "w-16 md:w-24", delay: 0.3, duration: 3.5 },
    { top: "15%", left: "10%", size: "w-18 md:w-26", delay: 0.6, duration: 2.8 },
    { top: "18%", left: "30%", size: "w-14 md:w-20", delay: 0.2, duration: 3.2 },
    { top: "25%", left: "2%", size: "w-16 md:w-22", delay: 0.8, duration: 3 },
    { top: "28%", left: "20%", size: "w-20 md:w-28", delay: 0.4, duration: 3.3 },
    { top: "35%", left: "8%", size: "w-18 md:w-24", delay: 0.1, duration: 2.9 },
    { top: "38%", left: "28%", size: "w-14 md:w-20", delay: 0.7, duration: 3.1 },
    { top: "45%", left: "5%", size: "w-16 md:w-22", delay: 0.5, duration: 3.4 },
    { top: "48%", left: "22%", size: "w-20 md:w-26", delay: 0.9, duration: 2.7 },
    { top: "55%", left: "12%", size: "w-18 md:w-24", delay: 0.2, duration: 3 },
    { top: "58%", left: "32%", size: "w-14 md:w-18", delay: 0.6, duration: 3.2 },
    { top: "65%", left: "3%", size: "w-20 md:w-28", delay: 0.4, duration: 2.8 },
    { top: "68%", left: "18%", size: "w-16 md:w-22", delay: 0.8, duration: 3.5 },
    { top: "75%", left: "8%", size: "w-18 md:w-26", delay: 0.1, duration: 3.1 },
    { top: "78%", left: "26%", size: "w-14 md:w-20", delay: 0.5, duration: 2.9 },
    { top: "85%", left: "15%", size: "w-20 md:w-24", delay: 0.3, duration: 3.3 },
    { top: "88%", left: "5%", size: "w-16 md:w-22", delay: 0.7, duration: 3 },
  ];

  // Pill positions - dense distribution on right side
  const pills = [
    { top: "5%", right: "5%", size: "w-16 md:w-22", delay: 0, duration: 3 },
    { top: "8%", right: "22%", size: "w-12 md:w-18", delay: 0.3, duration: 3.5 },
    { top: "12%", right: "10%", size: "w-14 md:w-20", delay: 0.6, duration: 2.8 },
    { top: "18%", right: "28%", size: "w-10 md:w-16", delay: 0.2, duration: 3.2 },
    { top: "22%", right: "2%", size: "w-12 md:w-18", delay: 0.8, duration: 3 },
    { top: "28%", right: "18%", size: "w-16 md:w-22", delay: 0.4, duration: 3.3 },
    { top: "32%", right: "8%", size: "w-14 md:w-20", delay: 0.1, duration: 2.9 },
    { top: "38%", right: "25%", size: "w-10 md:w-16", delay: 0.7, duration: 3.1 },
    { top: "42%", right: "5%", size: "w-12 md:w-18", delay: 0.5, duration: 3.4 },
    { top: "48%", right: "20%", size: "w-16 md:w-22", delay: 0.9, duration: 2.7 },
    { top: "52%", right: "12%", size: "w-14 md:w-20", delay: 0.2, duration: 3 },
    { top: "58%", right: "30%", size: "w-10 md:w-14", delay: 0.6, duration: 3.2 },
    { top: "62%", right: "3%", size: "w-16 md:w-22", delay: 0.4, duration: 2.8 },
    { top: "68%", right: "16%", size: "w-12 md:w-18", delay: 0.8, duration: 3.5 },
    { top: "72%", right: "8%", size: "w-14 md:w-20", delay: 0.1, duration: 3.1 },
    { top: "78%", right: "24%", size: "w-10 md:w-16", delay: 0.5, duration: 2.9 },
    { top: "82%", right: "15%", size: "w-16 md:w-20", delay: 0.3, duration: 3.3 },
    { top: "88%", right: "5%", size: "w-12 md:w-18", delay: 0.7, duration: 3 },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#f5f0e1] dark:bg-zinc-900 text-foreground border-b-4 border-border transition-colors duration-300">
      {/* Navbar/Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="relative z-50 transform -rotate-2 border-2 border-foreground bg-background px-4 py-1 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
           <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
              <span className="text-foreground">GOLDFUNX</span>
              <span className="text-metal-gold">6900</span>
           </h2>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="https://x.com/Goldfunx6900" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 border-2 border-border bg-card hover:bg-muted transition-colors rounded-full cursor-pointer"
            data-testid="link-twitter-hero"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <button 
            onClick={toggleTheme}
            className="p-2 border-2 border-border bg-card hover:bg-muted transition-colors rounded-full cursor-pointer"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {/* Floating Gold Bars - Left Side (Dense distribution) */}
      <div className="absolute left-0 top-0 h-full w-2/5 pointer-events-none overflow-hidden">
        {goldBars.map((bar, i) => (
          <motion.img
            key={`gold-${i}`}
            src={goldBarImg}
            alt="Gold Bar"
            className={`absolute ${bar.size} drop-shadow-lg`}
            style={{ top: bar.top, left: bar.left }}
            animate={{ y: [0, -15, 0], rotate: [0, i % 2 === 0 ? -8 : 8, 0] }}
            transition={{ duration: bar.duration, repeat: Infinity, ease: "easeInOut", delay: bar.delay }}
          />
        ))}
      </div>
      {/* Pumpfun Pills - Right Side (Dense distribution) */}
      <div className="absolute right-0 top-0 h-full w-2/5 pointer-events-none overflow-hidden">
        {pills.map((pill, i) => (
          <motion.img
            key={`pill-${i}`}
            src={pillImg}
            alt="Pumpfun Pill"
            className={`absolute ${pill.size} opacity-90`}
            style={{ top: pill.top, right: pill.right }}
            animate={{ y: [0, i % 2 === 0 ? -12 : 12, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
            transition={{ duration: pill.duration, repeat: Infinity, ease: "easeInOut", delay: pill.delay }}
          />
        ))}
      </div>
      {/* Giant Pill - Center Background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.img
          src={pillImg}
          alt="Giant Pumpfun Pill"
          className="w-[520px] md:w-[800px] lg:w-[1000px] opacity-25 dark:opacity-15"
          animate={{ y: [0, -20, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      {/* CA Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-24 md:top-28 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="bg-black/90 backdrop-blur-sm border-2 border-metal-gold px-4 py-2 font-mono text-sm md:text-base shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          <span className="text-metal-gold font-bold">CA:</span>
          <span className="text-white ml-2 tracking-wider" data-testid="ca-address">{config?.ca || "SOON"}</span>
        </div>
      </motion.div>
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block"
        >
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 text-black dark:text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">
            GOLDFUN<span className="text-metal-gold">X</span>
          </h1>
          
          <div className="bg-metal-gold text-black font-mono font-bold text-xl md:text-2xl px-6 py-2 inline-block transform -rotate-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            THE SUPERCYCLE INDEX
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <p className="text-xl md:text-2xl text-zinc-700 dark:text-gray-300 font-medium font-serif leading-relaxed">
            The Dollar is dying. The printing press is burning. <br/>
            <span className="font-bold text-black dark:text-white underline decoration-metal-gold decoration-4">We are the exit strategy.</span>
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button className="w-full md:w-auto px-8 py-4 bg-black text-white font-black text-lg uppercase tracking-widest hover:bg-zinc-800 transition-transform hover:-translate-y-1 shadow-[0_4px_0_rgba(0,0,0,0.5)] border-2 border-black cursor-pointer" data-testid="button-buy">
              Buy GoldFunX
            </button>
            <a href="#dashboard">
              <button className="w-full md:w-auto px-8 py-4 bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-black text-lg uppercase tracking-widest hover:bg-black/10 dark:hover:bg-white/10 transition-transform hover:-translate-y-1 cursor-pointer" data-testid="button-dashboard">
                Protocol Dashboard
              </button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
