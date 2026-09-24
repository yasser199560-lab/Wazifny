"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const columns = [
  {
    title: "Applicants",
    links: [
      { label: "Find Jobs", href: "/jobs" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    title: "Useful Links",
    links: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Center", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/images/wazifny-logo-horizontal.png"
              alt="Wazifny"
              width={120}
              height={31}
            />
            <ul className="mt-5 space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +961 1 234 567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> info@wazifny.lb
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("Beirut, Lebanon")}
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-wazifny-navy">
                {t(column.title)}
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-wazifny-navy"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-sm text-slate-400">
            © 2026 Wazifny. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Facebook className="h-4 w-4" />
            <Instagram className="h-4 w-4" />
            <Linkedin className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
