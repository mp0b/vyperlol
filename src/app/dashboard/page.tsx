import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  Circle,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getActiveProfile } from "@/lib/dashboard/active-profile";
import { WelcomeOverlay } from "@/components/dashboard/welcome-overlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default async function DashboardOverviewPage() {
  const user = await requireUser("/dashboard");
  const active = await getActiveProfile(user.id);
  if (!active) redirect("/onboarding");

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [profile, assetCount, badgeCount, recentViews] = await Promise.all([
    db.profile.findUnique({
      where: { id: active.id },
      select: {
        displayName: true,
        avatarUrl: true,
        bio: true,
        isPublished: true,
        viewCount: true,
        followerCount: true,
        customLinks: { where: { deletedAt: null, visibility: "PUBLIC" }, select: { id: true } },
        socialLinks: { where: { visible: true }, select: { id: true } },
      },
    }),
    db.asset.count({ where: { userId: user.id, deletedAt: null } }),
    db.userBadge.count({ where: { userId: user.id, visible: true, badge: { isPublic: true } } }),
    db.profileView.findMany({ where: { profileId: active.id, createdAt: { gte: fourteenDaysAgo } }, select: { createdAt: true } }),
  ]);
  if (!profile) redirect("/onboarding");

  const publicLinks = profile.customLinks.length + profile.socialLinks.length;
  const completionItems = [
    { label: "Photo de profil", complete: Boolean(profile.avatarUrl), href: "/dashboard/editor" },
    { label: "Nom ou bio", complete: Boolean(profile.displayName || profile.bio), href: "/dashboard/editor" },
    { label: "Premier lien", complete: publicLinks > 0, href: "/dashboard/editor" },
    { label: "Page publiée", complete: profile.isPublished, href: "/dashboard/editor" },
  ];
  const completion = Math.round((completionItems.filter((item) => item.complete).length / completionItems.length) * 100);

  const dayCounts = new Map<string, number>();
  for (const view of recentViews) dayCounts.set(dayKey(view.createdAt), (dayCounts.get(dayKey(view.createdAt)) ?? 0) + 1);
  const chart = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(fourteenDaysAgo);
    date.setDate(date.getDate() + index);
    return { label: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), value: dayCounts.get(dayKey(date)) ?? 0 };
  });
  const chartMax = Math.max(...chart.map((item) => item.value), 1);

  const stats = [
    { label: "Vues du profil", value: profile.viewCount, detail: "Total enregistré", icon: BarChart3 },
    { label: "Abonnés", value: profile.followerCount, detail: "Pour ce profil", icon: Users },
    { label: "Liens publics", value: publicLinks, detail: "Liens et réseaux", icon: Link2 },
    { label: "Médias", value: assetCount, detail: "Dans votre bibliothèque", icon: ImageIcon },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[92rem] space-y-6 p-5 text-[#fffaf4] sm:p-7 lg:p-10">
      <WelcomeOverlay />
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-orange-300"><Sparkles className="size-3.5" /> Espace créateur</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bonjour, @{active.username}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a79f95] sm:text-base">Retrouvez l’état réel de votre profil et reprenez là où vous vous étiez arrêté.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button asChild className="vy-action-secondary rounded-xl"><Link href="/dashboard/editor"><Palette className="size-4" /> Personnaliser</Link></Button><Button asChild className="vy-action-primary rounded-xl"><a href={`/${active.username}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /> Voir la page</a></Button></div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="vy-dashboard-panel rounded-2xl border text-[#fffaf4] transition-all">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-[#c6beb4]">{label}</CardTitle><span className="grid size-8 place-items-center rounded-lg border border-orange-300/15 bg-orange-400/[0.08]"><Icon className="size-4 text-orange-300" /></span></CardHeader>
            <CardContent><div className="text-3xl font-semibold tracking-tight">{value.toLocaleString("fr-FR")}</div><p className="mt-1 text-xs text-[#8f877e]">{detail}</p></CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.85fr)]">
        <Card className="vy-dashboard-panel overflow-hidden rounded-3xl border text-[#fffaf4]">
          <CardHeader className="pb-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle className="text-xl">Votre profil, prêt à partager</CardTitle><CardDescription className="mt-1 text-[#a79f95]">Complétez les éléments essentiels pour que votre page soit utilisable dès son ouverture.</CardDescription></div><span className="rounded-full border border-orange-300/15 bg-orange-400/[0.08] px-3 py-1 text-sm font-semibold text-orange-200">{completion}%</span></div></CardHeader>
          <CardContent className="space-y-5">
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#ffce7a,#ff983f_55%,#ef6a4a)] shadow-[0_0_16px_rgba(255,153,61,.55)]" style={{ width: `${completion}%` }} /></div>
            <div className="grid gap-2 sm:grid-cols-2">
              {completionItems.map((item) => (
                <Link key={item.label} href={item.href} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 px-3.5 py-3 transition-colors hover:border-orange-300/20 hover:bg-white/[0.035]">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full ${item.complete ? "bg-orange-400 text-[#211006] shadow-[0_0_14px_rgba(255,156,61,.36)]" : "border border-white/15 text-[#827a70]"}`}>{item.complete ? <Check className="size-3.5" /> : <Circle className="size-2" />}</span><span className="min-w-0 flex-1 text-sm font-medium">{item.label}</span><ArrowUpRight className="size-4 text-[#827a70] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-200" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="vy-dashboard-panel rounded-3xl border text-[#fffaf4]">
          <CardHeader><CardTitle className="text-xl">Accès rapide</CardTitle><CardDescription className="text-[#a79f95]">Des actions utiles, sans données factices.</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            <QuickLink href="/dashboard/editor" icon={Palette} title="Éditer le profil" detail="Liens, identité et thème" />
            <QuickLink href="/dashboard/media" icon={ImageIcon} title="Importer un média" detail={`${assetCount} fichier${assetCount === 1 ? "" : "s"} disponible${assetCount === 1 ? "" : "s"}`} />
            <QuickLink href="/dashboard/badges" icon={BadgeCheck} title="Voir les badges" detail={`${badgeCount} badge${badgeCount === 1 ? "" : "s"} obtenu${badgeCount === 1 ? "" : "s"}`} />
          </CardContent>
        </Card>
      </section>

      <Card className="vy-dashboard-panel rounded-3xl border text-[#fffaf4]">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0"><div><CardTitle className="text-xl">Visites récentes</CardTitle><CardDescription className="mt-1 text-[#a79f95]">14 derniers jours, d’après les visites réellement enregistrées sur @{active.username}.</CardDescription></div><span className="hidden rounded-lg border border-white/[0.08] bg-black/15 px-3 py-1.5 text-xs text-[#a79f95] sm:inline">{recentViews.length} visite{recentViews.length === 1 ? "" : "s"} récente{recentViews.length === 1 ? "" : "s"}</span></CardHeader>
        <CardContent>
          <div className="flex h-36 items-end gap-1.5 sm:gap-2" aria-label="Graphique des visites récentes">
            {chart.map((item) => <div key={item.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><div className="relative rounded-t-md bg-gradient-to-t from-orange-500/65 to-orange-200/90 transition-all group-hover:from-orange-400 group-hover:to-[#ffe1a9]" style={{ height: `${Math.max((item.value / chartMax) * 100, item.value ? 7 : 2)}%` }}><span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-black px-1.5 py-0.5 text-[10px] text-white group-hover:block">{item.value}</span></div><span className="mt-2 truncate text-center text-[10px] text-[#827a70]">{item.label}</span></div>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, detail }: { href: string; icon: typeof Palette; title: string; detail: string }) {
  return <Link href={href} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-3 transition-colors hover:border-orange-300/20 hover:bg-white/[0.04]"><span className="grid size-9 place-items-center rounded-lg bg-orange-400/[0.08] text-orange-300"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="block truncate text-xs text-[#8f877e]">{detail}</span></span><ArrowUpRight className="size-4 text-[#827a70] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-200" /></Link>;
}
