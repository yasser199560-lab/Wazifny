"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Building2,
  FilePlus,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  MessageSquare,
  Settings,
  Star,
  Users,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import { getNotifications, getConversations } from "@/lib/api";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "notifications" | "messages";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Post a Job", href: "/employer/post-job", icon: FilePlus },
  { label: "Manage Jobs", href: "/employer/manage-jobs", icon: Briefcase },
  { label: "Applicants", href: "/employer/applicants", icon: Users },
  { label: "Saved Candidates", href: "/employer/saved-candidates", icon: Star },
  { label: "Company Profile", href: "/employer/company-profile", icon: Building2 },
  { label: "Subscription", href: "/employer/subscription", icon: Settings },
  { label: "Messages", href: "/employer/messages", icon: MessageSquare, badgeKey: "messages" },
  { label: "Notifications", href: "/employer/notifications", icon: Bell, badgeKey: "notifications" },
];

export default function EmployerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useRequireAuth();
  const logout = useAuthStore((s) => s.logout);
  const token = useAuthStore((s) => s.token);

  const [badges, setBadges] = useState<{ notifications: number; messages: number }>({
    notifications: 0,
    messages: 0,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!token || status !== "ready") return;
    let cancelled = false;

    async function loadBadges() {
      try {
        const [notifs, convos] = await Promise.all([
          getNotifications(token as string),
          getConversations(token as string),
        ]);
        if (cancelled) return;
        setBadges({
          notifications: notifs.unread_count,
          messages: convos.reduce((sum, c) => sum + c.unread_count, 0),
        });
      } catch {
        // non-critical
      }
    }

    loadBadges();
    const interval = setInterval(loadBadges, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== "employer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-wazifny-navy">
            This area is for employer accounts only.
          </p>
          <Link href="/" className="mt-3 inline-block text-wazifny-green hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-72 shrink-0 flex-col bg-wazifny-navy px-5 py-6 md:flex">
        <Link href="/" className="mb-8 flex items-center px-1">
          <Image src="/images/wazifny-logo-horizontal.png" alt="Wazifny" width={124} height={32} className="h-8 w-auto" />
        </Link>

        <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wazifny-green text-sm font-bold text-white">
            {user.full_name?.[0]?.toUpperCase() || "E"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.full_name}</p>
            <p className="text-xs text-slate-400">Employer Account</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-wazifny-green/15 text-wazifny-green"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {badgeCount > 0 && (
                  <span className="rounded-full bg-wazifny-green px-2 py-0.5 text-xs font-semibold text-white">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
        <div className="-mx-4 mb-6 border-b border-slate-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6 md:hidden">
          <div className="flex items-center justify-between gap-3"><Link href="/" className="font-bold text-wazifny-navy">Wazifny</Link><button onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-wazifny-navy" aria-label="Toggle menu" aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
          {mobileOpen && <nav className="mt-3 space-y-1 border-t border-slate-100 pt-3">{NAV_ITEMS.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-3 text-sm font-semibold ${pathname === item.href ? "bg-wazifny-green/10 text-wazifny-green" : "text-slate-600 hover:bg-slate-50"}`}>{item.label}</Link>)}<button onClick={() => { logout(); router.push("/"); }} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-600">Sign out</button></nav>}
        </div>
        {children}
      </main>
    </div>
  );
}
