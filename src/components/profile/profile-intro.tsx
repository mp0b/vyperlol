"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import type { ProfileSettingsConfig } from "@/lib/profile/settings";

export function ProfileIntro({
  settings,
  preview = false,
  musicUrl,
}: {
  settings: ProfileSettingsConfig;
  preview?: boolean;
  musicUrl?: string;
}) {
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const introEnabled = settings.intro?.enabled ?? false;
  // If preview is true, we might want to bypass the intro so the user can edit their profile easily.
  // Or we show it once. Let's just bypass it in preview mode unless they explicitly want to see it,
  // but to keep it simple, let's bypass in preview.
  const shouldShowIntro = introEnabled && !entered && !preview;

  useEffect(() => {
    if (entered && musicUrl && audioRef.current) {
      audioRef.current.volume = settings.audio?.volume ?? 0.5;
      audioRef.current.loop = settings.audio?.loop ?? true;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [entered, musicUrl, settings.audio]);

  const handleEnter = () => {
    setEntered(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  };

  return (
    <>
      {shouldShowIntro && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-700"
          onClick={handleEnter}
        >
          <div className="flex flex-col items-center gap-4 text-white">
            <span className="animate-pulse font-mono text-sm uppercase tracking-widest opacity-80">
              [ {settings.intro?.text || "click to enter"} ]
            </span>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      {musicUrl && (
        <audio ref={audioRef} src={musicUrl} preload="auto" />
      )}

      {/* Audio Controls Widget (visible after entering if audio exists) */}
      {musicUrl && entered && !preview && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 p-2 px-3 text-white backdrop-blur-md shadow-2xl">
          <button onClick={togglePlay} className="hover:text-vy-accent transition-colors">
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <div className="h-4 w-px bg-white/20 mx-1"></div>
          <button onClick={toggleMute} className="hover:text-vy-accent transition-colors">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}
    </>
  );
}
