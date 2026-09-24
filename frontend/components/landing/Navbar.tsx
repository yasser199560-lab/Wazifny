"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Languages, LayoutDashboard, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import { useAuthStore, dashboardPathForRole } from "@/store/authStore";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Find Jobs", href: "/jobs" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { token, role, fullName, hydrate, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isSignedIn = Boolean(token && role);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/wazifny-logo-horizontal.png"
            alt="Wazifny"
            width={132}
            height={34}
            priority
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-wazifny-navy"
              >
                {t(link.label)}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-wazifny-navy md:hidden" aria-label="Toggle navigation" aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="hidden md:block">
        {isSignedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-3 text-sm font-medium text-wazifny-navy transition-colors hover:bg-slate-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-wazifny-green/10 text-wazifny-green">
                {role === "admin" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </span>
              {fullName?.split(" ")[0] || t("Account")}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="truncate text-sm font-semibold text-wazifny-navy">{fullName}</p>
                  <p className="text-xs capitalize text-slate-400">{role} {t("Account")}</p>
                </div>
                <Link
                  href={role ? dashboardPathForRole(role) : "/dashboard"}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-wazifny-navy"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t(role === "admin" ? "Admin Overview" : "My Dashboard")}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Log out")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Languages className="h-3.5 w-3.5" />
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as "en" | "ar")}
                aria-label={t("Choose language")}
                className="cursor-pointer border-0 bg-transparent py-1 text-xs font-semibold text-slate-600 focus:outline-none"
              >
                <option value="en">EN</option>
                <option value="ar">العربية</option>
              </select>
            </label>
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-wazifny-navy transition-colors hover:bg-slate-50"
            >
              {t("Login")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-wazifny-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-wazifny-green-dark"
            >
              {t("Register")}
            </Link>
          </div>
        )}</div>
      </nav>
      {mobileOpen && <div className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg md:hidden">
        <div className="mx-auto max-w-7xl space-y-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-wazifny-green">
              {t(link.label)}
            </Link>
          ))}
          <label className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2"><Languages className="h-4 w-4" />{t("Choose language")}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as "en" | "ar")} aria-label={t("Choose language")} className="bg-transparent text-sm font-semibold text-wazifny-navy outline-none"><option value="en">EN</option><option value="ar">العربية</option></select>
          </label>
          {isSignedIn ? <Link href={role ? dashboardPathForRole(role) : "/dashboard"} onClick={() => setMobileOpen(false)} className="block rounded-lg bg-wazifny-green px-3 py-3 text-sm font-semibold text-white">My dashboard</Link> : <div className="grid grid-cols-2 gap-2 pt-2"><Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-wazifny-navy">{t("Login")}</Link><Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-wazifny-green px-3 py-2.5 text-center text-sm font-semibold text-white">{t("Register")}</Link></div>}
        </div>
      </div>}
    </header>
  );
}
