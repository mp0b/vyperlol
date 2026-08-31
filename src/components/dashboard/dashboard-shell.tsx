"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BadgeCheck,
  ChevronsUpDown,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Wordmark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NewProfileDialog } from "@/components/dashboard/new-profile-dialog";
import { logoutAction } from "@/server/actions/auth";
import { setActiveProfileAction } from "@/server/actions/profiles";
import type { ProfileSummary } from "@/lib/dashboard/active-profile";
import { initials } from "@/lib/utils";

import { ShieldAlert } from "lucide-react";

export type DashboardUser = {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
}

const getNav = (role: string) => {
  const nav = [
    {
      label: "Espace",
      items: [
        { href: "/dashboard", label: "Vue d’ensemble", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/editor", label: "Personnaliser", icon: Palette },
        { href: "/dashboard/badges", label: "Badges", icon: BadgeCheck },
      ],
    },
    {
      label: "Bibliothèque",
      items: [
        { href: "/dashboard/media", label: "Médias", icon: ImageIcon },
        { href: "/dashboard/domains", label: "Domaines", icon: Globe2 },
      ],
    },
    {
      label: "Données",
      items: [{ href: "/leaderboard", label: "Classement", icon: BarChart3 }],
    },
  ];

  if (role === "ADMIN" || role === "OWNER") {
    nav.push({
      label: "Administration",
      items: [{ href: "/dashboard/admin", label: "Gérer les utilisateurs", icon: ShieldAlert }],
    });
  }

  return nav;
};

export function DashboardShell({
  user,
  profiles,
  activeProfile,
  children,
}: {
  user: DashboardUser;
  profiles: ProfileSummary[];
  activeProfile: ProfileSummary;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const navContent = (
    <nav className="flex flex-col gap-6" aria-label="Navigation du tableau de bord">
      {getNav(user.role).map((group) => (
        <section key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{group.label}</p>
          <div className="grid gap-1">
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileNav(false)}
                  className="vy-dashboard-nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                >
                  <item.icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );

  return (
    <div className="vy-dashboard flex min-h-svh">
      <aside className="vy-dashboard-sidebar fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] flex-col border-r lg:flex">
        <div className="flex h-[4.75rem] items-center border-b px-6">
          <Link href="/dashboard" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/30"><Wordmark className="text-white" /></Link>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">{navContent}</div>
        <div className="space-y-3 border-t p-4" style={{ borderColor: "var(--vy-dash-border)" }}>
          <a href={`/${activeProfile.username}`} target="_blank" rel="noopener noreferrer" className="vy-action-secondary flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all"><ExternalLink className="size-4" /> Voir mon profil</a>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-9 border border-white/10"><AvatarImage src={activeProfile.avatarUrl ?? undefined} alt="" /><AvatarFallback className="bg-white/10 text-xs text-white/80">{initials(activeProfile.displayName || activeProfile.username)}</AvatarFallback></Avatar>
              <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{activeProfile.displayName || `@${activeProfile.username}`}</p><p className="truncate text-xs text-white/50">@{activeProfile.username}</p></div>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col lg:pl-[17.5rem]">
        <header className="vy-dashboard-header sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileNav} onOpenChange={setMobileNav}>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="text-white lg:hidden" aria-label="Ouvrir le menu"><Menu className="size-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="vy-dashboard w-[18rem] border-r border-white/10 bg-black p-0 text-white">
                <SheetTitle className="flex h-[4.75rem] items-center border-b px-5" style={{ borderColor: "var(--vy-dash-border)" }}><Wordmark className="text-white" /></SheetTitle>
                <div className="p-4">{navContent}</div>
              </SheetContent>
            </Sheet>
            <ProfileSwitcher profiles={profiles} active={activeProfile} />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="hidden text-white hover:bg-white/[0.06] hover:text-white sm:inline-flex"><a href={`/${activeProfile.username}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /> Ouvrir</a></Button>
            <ThemeToggle />
            <AccountMenu user={user} />
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function ProfileSwitcher({ profiles, active }: { profiles: ProfileSummary[]; active: ProfileSummary }) {
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);
  const canCreate = profiles.length < 3;

  const switchTo = (id: string) => {
    if (id === active.id) return;
    void setActiveProfileAction(id).then((result) => {
      if (result.ok) router.refresh();
      else toast.error(result.error);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 max-w-[12rem] gap-2 rounded-xl px-2 text-white hover:bg-white/[0.06] hover:text-white">
            <Avatar className="size-7 border border-white/10"><AvatarImage src={active.avatarUrl ?? undefined} alt="" /><AvatarFallback className="bg-white/10 text-[10px] text-white/80">{initials(active.displayName || active.username)}</AvatarFallback></Avatar>
            <span className="truncate text-sm font-medium">@{active.username}</span><ChevronsUpDown className="size-3.5 shrink-0 text-white/50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 border-white/10 bg-[#0a0a0a] text-white">
          <DropdownMenuLabel className="flex items-center justify-between text-white/60"><span>Vos profils</span><span className="text-xs font-normal">{profiles.length}/3</span></DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          {profiles.map((profile) => (
            <DropdownMenuItem key={profile.id} onClick={() => switchTo(profile.id)} className="gap-2.5 text-white focus:bg-white/[0.08] focus:text-white">
              <Avatar className="size-6"><AvatarImage src={profile.avatarUrl ?? undefined} alt="" /><AvatarFallback className="bg-white/10 text-[10px] text-white/80">{initials(profile.displayName || profile.username)}</AvatarFallback></Avatar>
              <span className="truncate">@{profile.username}</span>{profile.id === active.id && <span className="ml-auto text-xs text-white/70">Actif</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem disabled={!canCreate} onClick={() => canCreate && setNewOpen(true)} className="gap-2 text-white focus:bg-white/[0.08] focus:text-white"><Plus className="size-4" /> {canCreate ? "Créer un profil" : "Limite de 3 profils atteinte"}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewProfileDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}

function AccountMenu({ user }: { user: DashboardUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-xl text-white hover:bg-white/[0.06] hover:text-white" aria-label="Menu du compte"><Avatar className="size-8 border border-white/10"><AvatarImage src={user.avatarUrl ?? undefined} alt="" /><AvatarFallback className="bg-white/[0.08] text-xs text-white">{initials(user.displayName || user.email)}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-white/10 bg-[#0a0a0a] text-white">
        <DropdownMenuLabel className="truncate text-white/60">{user.email}</DropdownMenuLabel>
        <form action={logoutAction}><button type="submit" className="w-full"><DropdownMenuItem variant="destructive" onSelect={(event) => event.preventDefault()} asChild><span className="flex w-full cursor-pointer items-center gap-2"><LogOut className="size-4" /> Se déconnecter</span></DropdownMenuItem></button></form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
