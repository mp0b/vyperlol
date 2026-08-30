"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function WelcomeOverlay() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-3xl"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-black to-red-600/10 pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(249,115,22,0.3)] font-mono">
              BIENVENUE.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 text-3xl md:text-4xl">
                Initialisation du système...
              </span>
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
