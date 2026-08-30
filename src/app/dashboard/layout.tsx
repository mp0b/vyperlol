import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getUserProfiles, getActiveProfile } from "@/lib/dashboard/active-profile";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { VerifyEmailBanner } from "@/components/dashboard/verify-email-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const [profiles, active] = await Promise.all([
    getUserProfiles(user.id),
    getActiveProfile(user.id),
  ]);

  if (!active) redirect("/onboarding");

  return (
    <DashboardShell
      user={{
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
      profiles={profiles}
      activeProfile={active}
    >
      {!user.emailVerified && <VerifyEmailBanner />}
      {children}
    </DashboardShell>
  );
}
