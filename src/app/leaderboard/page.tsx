import { HalftoneBg } from "@/components/marketing/halftone-bg";
import { SiteHeader } from "@/components/marketing/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { Trophy } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  const topProfiles = await db.profile.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { viewCount: 'desc' },
    take: 50,
  });

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden text-white relative">
      <SiteHeader authed={Boolean(user)} />
      <HalftoneBg />
      <main className="flex-1 flex flex-col items-center pt-40 pb-16 px-6 z-10">
        <div className="max-w-4xl w-full text-center mb-12">
          <Trophy className="w-16 h-16 text-orange-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">Leaderboard</h1>
          <p className="text-xl text-gray-400">The most visited profiles of all time.</p>
        </div>

        <div className="w-full max-w-3xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-2 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          {topProfiles.map((profile, i) => (
            <Link key={profile.id} href={`/${profile.username}`} className="flex items-center justify-between p-6 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer border-b border-white/5 last:border-0 relative z-10">
              <div className="flex items-center gap-6">
                <span className={`text-2xl font-bold w-12 text-center ${i === 0 ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] scale-110' : i === 1 ? 'text-gray-300 drop-shadow-md' : i === 2 ? 'text-amber-700 drop-shadow-md' : 'text-gray-600'}`}>
                  #{i + 1}
                </span>
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center font-bold overflow-hidden shadow-inner text-orange-500">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    profile.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">{profile.displayName || profile.username}</h3>
                  <p className="text-gray-400 text-sm font-mono">vyper.lol/{profile.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white bg-white/10 px-4 py-1.5 rounded-full text-sm border border-white/5">{profile.viewCount.toLocaleString()} views</p>
              </div>
            </Link>
          ))}
          {topProfiles.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              No profiles found yet. Be the first to rank up!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
