import { SiDiscord, SiGithub, SiSpotify, SiX } from "@icons-pack/react-simple-icons";
import { ArrowUpRight, BadgeCheck, MapPin } from "lucide-react";

/** A static, on-brand mock of a Vyper profile — the product, shown in the hero. */
export function HeroProfileMock() {
  return (
    <div className="relative w-full max-w-[380px]">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-60 blur-2xl"
        style={{ background: "radial-gradient(circle at 50% 30%, var(--brand), transparent 60%)" }}
      />
      <div
        className="relative overflow-hidden rounded-3xl border p-6 text-center"
        style={{
          background: "linear-gradient(160deg, #14122a, #0b0b16)",
          borderColor: "rgba(255,255,255,0.1)",
          boxShadow: "0 40px 120px -40px var(--brand)",
          color: "#f4f2ff",
        }}
      >
        <div
          className="mx-auto flex size-24 items-center justify-center rounded-full text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
            boxShadow: "0 0 0 4px rgba(124,92,255,0.25)",
          }}
        >
          A
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xl font-bold">
          Alex Rivera
          <BadgeCheck className="size-5 text-[var(--brand-2)]" />
        </div>
        <div className="text-sm text-white/50">@alex</div>
        <div className="mt-2 text-sm text-white/70">⚡ building the future of bio-links</div>
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-white/50">
          <MapPin className="size-3" /> Berlin, Germany
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-white/80">
          <SiGithub size={20} />
          <SiX size={20} />
          <SiDiscord size={20} />
          <SiSpotify size={20} />
        </div>

        <div className="mt-5 grid gap-2.5 text-left">
          {[
            { t: "My portfolio", d: "Selected work & case studies" },
            { t: "Latest project — Orbit", d: "A blazing-fast deploy CLI" },
          ].map((l) => (
            <div
              key={l.t}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div>
                <div className="text-sm font-semibold">{l.t}</div>
                <div className="text-xs text-white/45">{l.d}</div>
              </div>
              <ArrowUpRight className="ml-auto size-4 text-white/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
