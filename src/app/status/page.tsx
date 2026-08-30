import { HalftoneBg } from "@/components/marketing/halftone-bg";
import { SiteHeader } from "@/components/marketing/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { CheckCircle2, Activity } from "lucide-react";

const SERVICES = [
  { name: "Core Application", description: "Dashboard, Editor, and APIs" },
  { name: "Global Edge Network", description: "Profile delivery and routing" },
  { name: "Database Cluster", description: "Primary and replica databases" },
  { name: "Asset CDN", description: "Media storage and delivery" },
];

export default async function StatusPage() {
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden text-white relative">
      <SiteHeader authed={Boolean(user)} />
      <HalftoneBg />
      <main className="flex-1 flex flex-col items-center pt-40 pb-24 px-6 z-10 w-full max-w-5xl mx-auto">
        <div className="w-full text-left mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white">System Status</h1>
            <p className="text-xl text-gray-400">All systems are fully operational.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-6 py-3 rounded-full text-orange-500 font-medium">
            <Activity className="w-5 h-5 animate-pulse" />
            100% Uptime
          </div>
        </div>

        <div className="w-full grid gap-6">
          {SERVICES.map((service, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-500/10 transition-colors" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-1 text-white">{service.name}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </div>
                <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20 w-fit">
                  <CheckCircle2 className="w-5 h-5" /> Operational
                </div>
              </div>

              {/* 90-Day Uptime Graph */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>90 days ago</span>
                  <span>100% uptime</span>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-[2px] h-10">
                  {Array.from({ length: 90 }).map((_, j) => (
                    <div 
                      key={j} 
                      className="flex-1 bg-gradient-to-t from-orange-600 to-orange-400 rounded-sm hover:opacity-80 transition-opacity cursor-crosshair h-full"
                      title={`Day ${90 - j} - 100% Uptime`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
