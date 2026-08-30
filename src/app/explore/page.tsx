import { HalftoneBg } from "@/components/marketing/halftone-bg";
import { SiteHeader } from "@/components/marketing/site-header";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ExplorePage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden text-white relative">
      <SiteHeader authed={Boolean(user)} />
      <HalftoneBg />
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-16 px-6 z-10">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Explore</h1>
          <p className="text-xl text-gray-400 mb-12">Discover the most stunning profiles built on Vyper.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center p-6 hover:scale-105 transition-transform cursor-pointer hover:border-orange-500/50">
                <span className="text-gray-500 font-medium">Coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
