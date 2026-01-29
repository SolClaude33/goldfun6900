export function Ticker() {
  const items = [
    "GOLD ATH $4,530",
    "DOLLAR IS DYING",
    "WE ARE SO BACK",
    "GOLD SUPERCYCLE CONFIRMED",
    "FED PRINTING INFINITE CASH",
    "BUY THE DIP",
    "HODL FOR GOLD",
    "GOLDFUNX6900 TO THE MOON",
    "NO STAKING JUST EARN",
    "SUPPLY BURN IMMINENT"
  ];

  return (
    <div className="w-full bg-metal-gold text-black overflow-hidden py-3 border-y-2 border-black relative z-30 font-bold font-mono text-lg uppercase tracking-wider">
      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="mx-8 flex items-center">
            <span className="mr-2 text-green-700">▲</span> {item}
          </span>
        ))}
        {items.map((item, i) => (
          <span key={`dup-${i}`} className="mx-8 flex items-center">
            <span className="mr-2 text-green-700">▲</span> {item}
          </span>
        ))}
      </div>
    </div>
  );
}
