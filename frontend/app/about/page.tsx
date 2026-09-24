import { Globe, Heart, Target, Users } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CTABanner from "@/components/landing/CTABanner";
import { getArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

const WHY_CARDS = [
  {
    icon: Target,
    title: "Precision Matching",
    description:
      "We use AI to ensure every talent and job match is based on real skills and actual requirements.",
  },
  {
    icon: Heart,
    title: "Lebanon First",
    description:
      "Built specifically for the Lebanese job market, aggregating opportunities from across the country.",
  },
  {
    icon: Users,
    title: "Both Sides Win",
    description:
      "We balance the needs of job seekers and employers equally — reducing manual effort for both.",
  },
  {
    icon: Globe,
    title: "Inclusive Access",
    description: "Built to serve Lebanon's diverse, multilingual job-seeking community.",
  },
];

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default async function AboutPage() {
  const articles = await getArticles();

  return (
    <main>
      <Navbar />

      <section className="relative overflow-hidden bg-wazifny-navy py-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/images/hero-bg.svg')" }}
        />
        <div className="absolute inset-0 bg-wazifny-navy/70" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">About Us 🔥</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card sm:p-10">
          <p className="text-slate-600">
            Wazifny is an AI-powered employment platform built specifically
            for the Lebanese job market. It connects job seekers with
            opportunities matched to their real skills and experience,
            while giving employers efficient tools to post jobs and manage
            applicants. Matching draws from AI models reasoning over real,
            active job postings — never invented listings — so
            recommendations stay trustworthy as the platform grows.
          </p>

          <h2 className="mt-8 font-semibold text-wazifny-navy">Our Mission</h2>
          <p className="mt-2 text-slate-600">
            To reduce manual effort on both sides of the job search — using
            AI to cut down repetitive profile entry for talents, and to
            surface only relevant, well-matched opportunities, while laying
            the foundation for AI-assisted candidate screening for
            employers.
          </p>

          <h2 className="mt-8 font-semibold text-wazifny-navy">Our Vision</h2>
          <p className="mt-2 text-slate-600">
            To become Lebanon&apos;s most trusted AI-driven job platform —
            connecting talent with opportunity through technology that
            actually understands both sides.
          </p>

          <h2 className="mt-8 font-semibold text-wazifny-navy">Core Objectives</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
            <li>Deliver transparent, AI-assisted matching for job seekers and employers alike.</li>
            <li>Build trust through real, verified job postings — never fabricated listings.</li>
            <li>Reduce the manual overhead of job searching and candidate screening.</li>
            <li>Support Lebanon&apos;s labor market with a platform built for it specifically.</li>
          </ul>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-wazifny-navy">Why Wazifny?</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-wazifny-green/10 text-wazifny-green">
                  <card.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-wazifny-navy">{card.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-wazifny-navy">Guides</h2>
            <p className="mt-1 text-sm text-slate-500">
              How Wazifny&apos;s features actually work, written with AI assistance
            </p>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-xl border border-slate-100 bg-white p-5 shadow-card"
                >
                  <p className="text-xs text-slate-400">{formatDate(article.published_at)}</p>
                  <h3 className="mt-1 font-semibold text-wazifny-navy">{article.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{article.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
      <Footer />
    </main>
  );
}
