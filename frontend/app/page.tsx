import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import Features from "@/components/landing/Features";
import Categories from "@/components/landing/Categories";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTABanner from "@/components/landing/CTABanner";
import Footer from "@/components/landing/Footer";
import { getLandingData } from "@/lib/api";

// Always hit the backend for fresh counts instead of caching the page.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Single server-side call to the FastAPI backend. If it's unreachable
  // (not running yet, DB not connected, etc.) this returns null and every
  // section below quietly falls back to its static placeholder content
  // instead of breaking the page.
  const landingData = await getLandingData();

  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar stats={landingData?.stats} />
      <Features />
      <Categories categories={landingData?.categories} />
      <HowItWorks />
      <Testimonials testimonials={landingData?.testimonials} />
      <CTABanner />
      <Footer />
    </main>
  );
}
