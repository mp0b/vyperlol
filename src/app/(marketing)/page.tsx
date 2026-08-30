"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HalftoneBg } from "@/components/marketing/halftone-bg";
import { SiteHeader } from "@/components/marketing/site-header";
import { TrustedMarquee } from "@/components/marketing/trusted-marquee";
import { motion } from "framer-motion";
import { Palette, ShieldCheck, Blocks } from "lucide-react";

const FEATURES = [
  { icon: Palette, title: "Themes without limits", body: "Backgrounds, gradients, fonts, effects, cursors — control every pixel with a live preview as you edit." },
  { icon: Blocks, title: "Sections & widgets", body: "Drag-and-drop sections for projects, music, galleries, games and live widgets like clocks." },
  { icon: ShieldCheck, title: "Secure by default", body: "Sanitized content, sandboxed embeds, rate limiting and OAuth. Your identity, protected." },
];

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
  >
    {children}
  </motion.div>
);

function ClaimBox() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      router.push(`/register?username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative w-full max-w-xl group"
    >
      {/* Heavy animated glow border for the box */}
      <div className="absolute -inset-[2px] bg-gradient-to-r from-orange-500 via-red-600 to-orange-500 rounded-[2rem] opacity-30 group-hover:opacity-70 group-hover:animate-pulse transition-opacity duration-700 blur-[2px]" />
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500 rounded-[2rem] opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-700" />
      
      <div className="relative bg-black/80 backdrop-blur-2xl rounded-[2rem] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-white tracking-tight drop-shadow-md">Réserve ton lien Vyper</h3>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 relative">
          <div className="flex-1 relative flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-orange-500/50 focus-within:bg-white/10 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
            <span className="pl-6 text-gray-400 font-medium select-none">vyper.lol/</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
              className="w-full bg-transparent border-none text-white font-bold py-4 pr-6 focus:outline-none focus:ring-0 placeholder:text-gray-600"
              placeholder="pseudo"
            />
          </div>
          <button
            type="submit"
            className="group/btn relative whitespace-nowrap bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold px-10 py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.8)] overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative z-10 text-lg">Réserver</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <HalftoneBg />

      <div className="flex-1 w-full relative z-10 flex flex-col pt-32 pb-16">
        
        {/* Hero Section */}
        <main className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 px-8 sm:px-16 lg:px-24 py-16 lg:py-32 w-full max-w-[1800px] mx-auto min-h-[65vh]">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-6 group cursor-default flex-1 justify-center lg:justify-start">
            <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white transform group-hover:scale-105 transition-transform duration-500 ease-out flex-shrink-0">
              <path d="M10 20 L50 40 L90 10 L80 50 L95 85 L50 60 L15 90 L25 50 Z" fill="currentColor"/>
              <path d="M50 40 L50 60" stroke="black" strokeWidth="2"/>
              <path d="M10 20 L50 60" stroke="black" strokeWidth="2"/>
            </svg>
            
            <h1 className="text-7xl sm:text-8xl lg:text-[10rem] font-bold tracking-tighter lowercase leading-none flex flex-wrap gap-x-4 gap-y-2">
              <span className="inline-block overflow-hidden pt-2">
                <motion.span 
                  initial={{ y: "120%" }} 
                  animate={{ y: "0%" }} 
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block pb-2"
                >
                  vyper
                </motion.span>
              </span>
              <span className="inline-block overflow-hidden pt-2">
                <motion.span 
                  initial={{ y: "120%" }} 
                  animate={{ y: "0%" }} 
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                  className="inline-block pb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600"
                >
                  .lol
                </motion.span>
              </span>
            </h1>
          </div>

          {/* Right: Input & Social Proof */}
          <div className="flex-1 flex flex-col items-center lg:items-end justify-center w-full relative">
            <ClaimBox />

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute -bottom-20 lg:-bottom-24 flex flex-row items-center justify-center lg:justify-end gap-4 w-full max-w-xl"
            >
              <div className="flex -space-x-3">
                {[
                  "2f563338-39fa-47ea-9761-658d4f3f84db",
                  "4f5668c5-fc4a-44e0-bc5e-a664189d3c31",
                  "eca707cc-a5b7-439a-b4fd-247f6106c2e1",
                  "77415a2e-dcbc-4748-a29d-fced4821881a"
                ].map((id) => (
                  <div key={id} className="w-10 h-10 rounded-full p-[2px] bg-black border border-white/10 shadow-lg overflow-hidden relative hover:z-10 hover:scale-110 transition-transform cursor-pointer">
                    <img className="w-full h-full rounded-full object-cover" src={`https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/${id}_1600w.jpg`} alt="User avatar" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium tracking-wide text-gray-400 drop-shadow-sm">Approuvé par +5 000 Utilisateurs</span>
            </motion.div>
          </div>
        </main>

        <TrustedMarquee />

        {/* Features Section */}
        <section id="features" className="w-full relative py-32 mt-12">
          <div className="max-w-[1800px] mx-auto px-8 sm:px-16 lg:px-24">
            <FadeIn>
              <div className="max-w-4xl mb-24 text-center mx-auto">
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-white drop-shadow-md">
                  Tout ce qu&apos;il te faut.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Parfaitement sur-mesure.</span>
                </h2>
                <p className="text-xl text-gray-300 drop-shadow-sm max-w-2xl mx-auto">
                  Plus de 50+ fonctionnalités de personnalisation. Génération par IA. Noms de domaine personnalisés. La limite, c&apos;est ton imagination.
                </p>
              </div>
            </FadeIn>
            
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-stretch">
              <FadeIn delay={0.1}>
                <div className="h-full group rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-md p-8 sm:p-12 lg:p-16 shadow-2xl transition-all hover:bg-black/60 hover:border-orange-500/30 overflow-hidden relative flex flex-col cursor-default">
                  <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-orange-500/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Mock Profile Screenshot - Flow Layout */}
                  <div className="w-full flex justify-center mb-12 relative z-10">
                    <div className="w-full max-w-sm rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_-10px_rgba(249,115,22,0.3)] transform group-hover:-translate-y-4 group-hover:scale-[1.02] transition-all duration-700">
                      <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4f5668c5-fc4a-44e0-bc5e-a664189d3c31_1600w.jpg" alt="Profile Mock" className="w-full h-auto" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 flex items-end p-6">
                        <div className="w-full flex items-center justify-between">
                          <div>
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md mb-2 border border-white/20" />
                            <div className="h-3 w-24 bg-white/30 rounded-full mb-1" />
                            <div className="h-2 w-16 bg-white/10 rounded-full" />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto text-center">
                    <h3 className="text-3xl font-bold mb-4 text-white drop-shadow-sm">Des Link-in-bios magnifiques</h3>
                    <p className="text-lg text-gray-400 leading-relaxed">Ton identité, sans compromis. Une esthétique ultra-moderne et glassmorphique intégrée au cœur de ton profil.</p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="h-full group rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-md p-8 sm:p-12 lg:p-16 shadow-2xl transition-all hover:bg-black/60 hover:border-red-500/30 overflow-hidden relative flex flex-col cursor-default">
                  <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-red-600/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Real-looking Dashboard UI Mock - Flow Layout */}
                  <div className="w-full flex justify-center mb-12 relative z-10">
                    <div className="w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_-10px_rgba(220,38,38,0.3)] transform group-hover:-translate-y-2 group-hover:scale-[1.02] transition-all duration-700 bg-black/90 backdrop-blur-xl flex flex-col">
                      <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/[0.02]">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <div className="ml-4 h-4 w-32 bg-white/10 rounded-full" />
                      </div>
                      <div className="p-6 grid grid-cols-3 gap-4 flex-1">
                        <div className="col-span-1 flex flex-col gap-3">
                          <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5" />
                          <div className="h-8 w-3/4 bg-white/5 rounded-lg border border-white/5" />
                          <div className="h-8 w-5/6 bg-white/5 rounded-lg border border-white/5" />
                          <div className="h-8 w-full bg-gradient-to-r from-orange-500/20 to-transparent border-l-2 border-orange-500 rounded-r-lg" />
                        </div>
                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-white/10 flex flex-col justify-between p-4">
                            <div className="h-3 w-1/2 bg-white/30 rounded-full" />
                            <div className="h-6 w-1/3 bg-white text-white rounded-full" />
                          </div>
                          <div className="h-24 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between p-4">
                            <div className="h-3 w-1/2 bg-white/20 rounded-full" />
                            <div className="h-6 w-1/3 bg-white/40 rounded-full" />
                          </div>
                          <div className="col-span-1 sm:col-span-2 h-32 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3 relative overflow-hidden">
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-500/20 to-transparent blur-xl" />
                            <div className="h-3 w-1/4 bg-white/20 rounded-full" />
                            <div className="flex-1 w-full bg-black/50 border border-white/10 rounded-xl flex items-center justify-center">
                              <div className="px-4 py-2 bg-orange-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">IA Generation</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto text-left">
                    <h3 className="text-3xl font-bold mb-4 text-white drop-shadow-sm">Dashboard Puissant</h3>
                    <p className="text-lg text-gray-400 leading-relaxed">Génération par IA, Domaines personnalisés, Hébergement de médias et analyses profondes. Gère la totalité de ton écosystème avec précision.</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Global Platform Stats Section */}
            <FadeIn delay={0.3}>
              <div className="mt-12 lg:mt-16 group rounded-[3rem] border border-white/5 bg-black/40 backdrop-blur-md p-10 sm:p-16 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center cursor-default hover:bg-black/60 hover:border-orange-500/30 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none opacity-30 group-hover:opacity-100 group-hover:scale-150 transition-all duration-1000" />
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-orange-500/20 blur-3xl rounded-full group-hover:bg-red-500/30 transition-colors duration-700" />
                
                <h3 className="text-3xl md:text-4xl font-bold mb-16 text-white relative z-10 tracking-tight">L'écosystème en chiffres</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full relative z-10">
                  <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center">
                    <span className="font-mono text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-3 drop-shadow-lg">
                      12M<span className="text-orange-500">+</span>
                    </span>
                    <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-orange-400/80 uppercase">Vues de Profils</span>
                  </motion.div>
                  
                  <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center">
                    <span className="font-mono text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-3 drop-shadow-lg">
                      50k<span className="text-orange-500">+</span>
                    </span>
                    <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-orange-400/80 uppercase">Créateurs</span>
                  </motion.div>
                  
                  <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center">
                    <span className="font-mono text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-3 drop-shadow-lg">
                      2.4M
                    </span>
                    <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-orange-400/80 uppercase">Fichiers Hébergés</span>
                  </motion.div>
                  
                  <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center">
                    <span className="font-mono text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 mb-3 drop-shadow-lg">
                      99.9<span className="text-orange-500">%</span>
                    </span>
                    <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-orange-400/80 uppercase">Uptime Global</span>
                  </motion.div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </div>
  );
}
