"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import type { RenderMusicTrack } from "@/lib/profile/types";

/**
 * Profile audio player. Autoplay is best-effort only — browsers block it
 * without a gesture and we never fight that; playback simply starts on the
 * first user interaction.
 */
export function AudioPlayer({
  tracks,
  autoplay = false,
  loop = true,
  initialVolume = 0.5,
}: {
  tracks: RenderMusicTrack[];
  autoplay?: boolean;
  loop?: boolean;
  initialVolume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);

  const track = tracks[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = initialVolume;
    if (autoplay) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [autoplay, initialVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () =>
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onEnd = () => next();
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!track) return null;

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  const next = () => setIndex((i) => (i + 1) % tracks.length);
  const prev = () => setIndex((i) => (i - 1 + tracks.length) % tracks.length);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: 12,
        borderRadius: 14,
        background: "color-mix(in srgb, #fff 6%, transparent)",
        border: "1px solid color-mix(in srgb, #fff 8%, transparent)",
      }}
    >
      <audio ref={audioRef} src={track.audioUrl} loop={loop && tracks.length === 1} preload="none" />
      {track.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.coverUrl}
          alt=""
          width={46}
          height={46}
          style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
        />
      ) : null}
      <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
        <div style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {track.title}
        </div>
        {track.artist ? (
          <div style={{ fontSize: "0.75rem", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {track.artist}
          </div>
        ) : null}
        <div style={{ height: 3, borderRadius: 3, background: "rgba(255,255,255,0.15)", marginTop: 6 }}>
          <div style={{ height: "100%", width: `${progress}%`, borderRadius: 3, background: "var(--vy-accent)" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--vy-text)" }}>
        {tracks.length > 1 && (
          <button type="button" onClick={prev} aria-label="Previous" className="vy-audio-btn">
            <SkipBack size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            display: "grid",
            placeItems: "center",
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "var(--vy-accent)",
            color: "#fff",
          }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
        </button>
        {tracks.length > 1 && (
          <button type="button" onClick={next} aria-label="Next" className="vy-audio-btn">
            <SkipForward size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            a.muted = !a.muted;
            setMuted(a.muted);
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="vy-audio-btn"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}
