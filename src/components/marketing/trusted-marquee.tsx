"use client";

import { Star } from "lucide-react";
import { useEffect, useRef } from "react";

const REVIEWS = [
  { name: "Kael", handle: "@kael_vision", text: "L'outil ultime. Créer un link-in-bio ultra esthétique m'a pris exactement 2 minutes. La DA est incroyable.", lang: "FR", avatar: "https://i.pravatar.cc/150?u=kael" },
  { name: "Aria", handle: "@ariacodes", text: "The AI generation is flawless. It built my entire page based on my vibe instantly. Cannot recommend enough.", lang: "EN", avatar: "https://i.pravatar.cc/150?u=aria" },
  { name: "Zephyr", handle: "@zephyr_x", text: "Die Anpassungsmöglichkeiten sind grenzenlos. Perfekt für Content Creator.", lang: "DE", avatar: "https://i.pravatar.cc/150?u=zephyr" },
  { name: "Nova", handle: "@nova_star", text: "¡Simplemente la mejor plataforma! Animaciones fluidas, dominios personalizados, 10/10.", lang: "ES", avatar: "https://i.pravatar.cc/150?u=nova" },
  { name: "Rin", handle: "@rin_dev", text: "美しさと機能性を兼ね備えた最高のプロフィール作成ツールです。", lang: "JP", avatar: "https://i.pravatar.cc/150?u=rin" },
  { name: "Nexus", handle: "@nexus_eth", text: "Enfin un builder qui comprend les besoins Web3. L'intégration est parfaite et le design solar frappe fort.", lang: "FR", avatar: "https://i.pravatar.cc/150?u=nexus" },
  { name: "Luna", handle: "@luna_creates", text: "Ditched Linktree. The glassmorphism and motion effects on Vyper are on another level entirely.", lang: "EN", avatar: "https://i.pravatar.cc/150?u=luna" },
];

export function TrustedMarquee() {
  return (
    <section className="w-full py-24 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />
      
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Approuvé par le monde entier.</h2>
        <p className="text-gray-400 mt-3">Rejoins des milliers de créateurs d'élite sur Vyper.</p>
      </div>

      <div className="flex relative w-full overflow-hidden">
        {/* We use a CSS animation to scroll -50% of the flex container */}
        <div className="flex gap-6 w-max animate-infinite-scroll hover:[animation-play-state:paused] px-3">
          {/* Double array for seamless loop */}
          {[...REVIEWS, ...REVIEWS].map((review, i) => (
            <div key={i} className="w-[350px] shrink-0 bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:border-orange-500/50 hover:bg-black/60 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex gap-1 mb-4 text-orange-500">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{review.text}"</p>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border border-white/20">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">{review.name}</h4>
                    <p className="text-gray-500 text-xs font-mono">{review.handle}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-md text-gray-400 border border-white/5">{review.lang}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
