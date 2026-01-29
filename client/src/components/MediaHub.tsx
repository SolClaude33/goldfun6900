import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function MediaHub() {
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
    <section className="py-24 bg-zinc-950 border-t border-gray-900">
      <div className="container mx-auto px-4">
         <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">GOLD TV</h2>
               <p className="text-gray-400 font-mono">Uncensored financial truth. Watch before they delete it.</p>
            </div>
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
               <span className="text-red-500 font-mono text-xs tracking-widest uppercase">LIVE BROADCAST</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, i) => (
               <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-black border border-gray-800 p-2 group cursor-pointer"
               >
                  <div className="aspect-video bg-zinc-900 relative mb-4 overflow-hidden border border-gray-900">
                     {/* Placeholder for video thumbnail - using a gradient for now */}
                     <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black group-hover:scale-105 transition-transform duration-500" />
                     
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-metal-gold flex items-center justify-center text-black shadow-lg">
                           <Play className="fill-current w-5 h-5 ml-1" />
                        </div>
                     </div>
                     
                     <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 font-mono">
                        {video.duration}
                     </div>
                  </div>
                  
                  <div className="px-2 pb-2">
                     <h3 className="text-lg font-bold text-white mb-1 group-hover:text-metal-gold transition-colors">{video.title}</h3>
                     <p className="text-xs text-gray-500 font-mono">{video.views}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </section>
  );
}
