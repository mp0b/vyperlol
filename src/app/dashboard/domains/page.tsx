import { CheckCircle2, CircleAlert, Globe, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getActiveProfile } from "@/lib/dashboard/active-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const statusLabels = {
  PENDING: "En attente de vérification DNS",
  ACTIVE: "Actif",
  ERROR: "Configuration à corriger",
} as const;

export default async function DomainsPage() {
  const user = await requireUser("/dashboard/domains");
  const active = await getActiveProfile(user.id);
  if (!active) redirect("/onboarding");
  const domains = await db.customDomain.findMany({ where: { profileId: active.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6 text-white md:p-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Domaines</h2>
        <p className="mt-2 text-gray-400">Votre lien Vyper est toujours disponible, avec ou sans domaine personnalisé.</p>
      </div>
      <Card className="vy-dashboard-panel border-white/40/20 text-white">
        <CardHeader className="flex-row items-start gap-4 space-y-0"><div className="rounded-2xl bg-white/15 p-3"><Globe className="size-6 text-white/70" /></div><div><CardTitle>Adresse Vyper par défaut</CardTitle><CardDescription className="mt-1 text-white/50/70">Cette adresse est toujours associée à votre profil actif.</CardDescription></div></CardHeader>
        <CardContent><code className="rounded-lg border border-white/20 bg-black/25 px-3 py-2 text-sm text-white/50">vyper.lol/{active.username}</code></CardContent>
      </Card>
      {domains.length === 0 ? (
        <Card className="vy-dashboard-panel border-dashed text-white"><CardContent className="flex min-h-52 flex-col items-center justify-center px-6 text-center"><ShieldCheck className="mb-4 size-9 text-white/70" /><h3 className="text-xl font-semibold">Aucun domaine personnalisé</h3><p className="mt-2 max-w-lg text-sm text-muted-foreground">Aucun domaine n’est actuellement configuré pour @{active.username}. La page publique utilise donc l’adresse Vyper ci-dessus.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {domains.map((domain) => {
            const activeDomain = domain.verified && domain.sslStatus === "ACTIVE";
            return <Card key={domain.id} className="vy-dashboard-panel border text-white"><CardHeader className="flex-row items-start justify-between gap-4 space-y-0"><div><CardTitle>{domain.domain}</CardTitle><CardDescription className="mt-1">{statusLabels[domain.sslStatus]}</CardDescription></div>{activeDomain ? <CheckCircle2 className="size-5 text-white/70" /> : <CircleAlert className="size-5 text-white/70" />}</CardHeader><CardContent className="text-sm text-muted-foreground">{domain.verified ? "DNS vérifié" : `Ajoutez le jeton DNS ${domain.verificationToken} pour vérifier ce domaine.`}</CardContent></Card>;
          })}
        </div>
      )}
    </div>
  );
}
