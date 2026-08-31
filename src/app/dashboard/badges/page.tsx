import { BadgeCheck, LockKeyhole, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BadgesPage() {
  const user = await requireUser("/dashboard/badges");
  const badges = await db.userBadge.findMany({
    where: { userId: user.id, badge: { isPublic: true } },
    include: { badge: true },
    orderBy: [{ order: "asc" }, { grantedAt: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 text-white md:p-10">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">Badges</h2>
        <p className="mt-2 text-gray-400">Les badges sont attribués par Vyper ou obtenus via les étapes prévues. Ils ne peuvent pas être activés artificiellement.</p>
      </div>

      {badges.length === 0 ? (
        <Card className="vy-dashboard-panel border text-white">
          <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 rounded-2xl border border-white/40/20 bg-white/10 p-4"><LockKeyhole className="size-8 text-white/70" /></div>
            <h3 className="text-xl font-semibold">Pas encore de badge</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Quand vous obtiendrez un badge — vérification, contribution ou programme spécial — il apparaîtra ici et pourra être affiché sur votre profil.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {badges.map(({ id, visible, grantedAt, badge }) => (
            <Card key={id} className="vy-dashboard-panel group relative overflow-hidden border text-white transition-colors hover:border-white/40/35">
              <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/10 blur-3xl" />
              <CardHeader className="relative flex-row items-start gap-4 space-y-0">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3"><BadgeCheck className="size-6 text-white/70" /></div>
                <div className="min-w-0 flex-1"><CardTitle>{badge.name}</CardTitle><CardDescription className="mt-1 text-gray-400">{badge.description ?? "Badge Vyper"}</CardDescription></div>
              </CardHeader>
              <CardContent className="relative flex items-center justify-between gap-4 text-xs text-muted-foreground">
                <span>Obtenu le {grantedAt.toLocaleDateString("fr-FR")}</span>
                <span className={visible ? "text-white/60" : "text-muted-foreground"}>{visible ? "Affiché" : "Masqué"}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles className="size-3.5 text-white/70" />Les badges visibles sont automatiquement intégrés à votre page publique.</p>
    </div>
  );
}
