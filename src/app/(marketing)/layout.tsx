import { getCurrentUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/marketing/site-header";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden text-white relative">
      <SiteHeader authed={Boolean(user)} />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
