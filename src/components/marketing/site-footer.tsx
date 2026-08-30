import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/explore", label: "Explore" },
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/pricing", label: "Pricing" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/guidelines", label: "Guidelines" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
      { href: "/dmca", label: "DMCA" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/api/docs", label: "API docs" },
      { href: "/api/v1/openapi.json", label: "OpenAPI" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Your entire internet identity in one link. Free, fast, and yours.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 grid gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Vyper. All rights reserved.</p>
          <p>Made for the internet.</p>
        </div>
      </div>
    </footer>
  );
}
