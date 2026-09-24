"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BriefcaseBusiness, LogOut, Menu, ShieldBan, Users, X } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/authStore";

const navigation = [
  { label: "Overview", href: "/overview", icon: BarChart3 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Blocked Users", href: "/blocked-users", icon: ShieldBan },
  { label: "Jobs Moderation", href: "/jobs-moderation", icon: BriefcaseBusiness },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, status } = useRequireAuth();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  if (status === "loading") return <div className="min-h-screen bg-slate-50" />;
  if (!user || user.role !== "admin") return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-wazifny-navy">This area is for administrators only.</div>;

  return <div className="flex min-h-screen bg-slate-50">
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col bg-wazifny-navy md:flex">
      <Link href="/overview" className="border-b border-white/10 px-5 py-5"><Image src="/images/wazifny-logo-horizontal.png" alt="Wazifny" width={120} height={31} /></Link>
      <div className="border-b border-white/10 px-5 py-5"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-wazifny-green font-bold text-white">{user.full_name[0]?.toUpperCase() || "A"}</span><div><p className="text-sm font-semibold text-white">{user.full_name}</p><p className="text-xs text-slate-400">Admin Account</p></div></div></div>
      <nav className="flex-1 space-y-1 px-4 py-5">{navigation.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${pathname === href ? "border-l-2 border-wazifny-green bg-white/15 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
      <button onClick={() => { logout(); router.push("/login"); }} className="border-t border-white/10 px-7 py-5 text-left text-sm text-slate-400 hover:text-white"><span className="flex items-center gap-3"><LogOut className="h-4 w-4" />Sign Out</span></button>
    </aside>
    <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8">
      <div className="-mx-4 mb-6 border-b border-slate-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6 md:hidden"><div className="flex items-center justify-between"><Link href="/overview" className="font-bold text-wazifny-navy">Wazifny Admin</Link><button onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-wazifny-navy" aria-label="Toggle menu" aria-expanded={mobileOpen}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>{mobileOpen && <nav className="mt-3 space-y-1 border-t border-slate-100 pt-3">{navigation.map(({ label, href }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-3 text-sm font-semibold ${pathname === href ? "bg-wazifny-green/10 text-wazifny-green" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>)}<button onClick={() => { logout(); router.push("/login"); }} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-600">Sign out</button></nav>}</div>
      {children}
    </main>
  </div>;
}
