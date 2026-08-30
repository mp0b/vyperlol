import { cn } from "@/lib/utils";

/** Vyper mark — an angular bolt-V in the brand gradient. Original artwork. */
export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="vy-logo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <path
        d="M4 5h6.5l4.2 12.4L18 9h6l-7.8 18h-4.9L4 5Z"
        fill="url(#vy-logo)"
      />
      <path d="M20.5 5H28l-6 14-3.2-4.6L20.5 5Z" fill="url(#vy-logo)" opacity="0.55" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <Logo />
      <span className="text-lg">
        Vyper<span className="text-[var(--brand)]">.lol</span>
      </span>
    </span>
  );
}
