"use client";

import { Star } from "lucide-react";
import { testimonials as fallbackTestimonials } from "@/lib/landing-data";
import type { LandingTestimonial } from "@/lib/api";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Testimonials({
  testimonials,
}: {
  testimonials?: LandingTestimonial[];
}) {
  const { t } = useLanguage();
  const data = testimonials && testimonials.length > 0 ? testimonials : fallbackTestimonials;
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-wazifny-navy sm:text-4xl">
          {t("Trusted by Lebanon's workforce")}
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {data.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="rounded-xl border border-slate-100 bg-white p-6 shadow-card"
            >
              <div className="flex gap-0.5 text-wazifny-orange">
                {Array.from({ length: testimonial.rating ?? 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
                &ldquo;{t(testimonial.quote)}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <p className="font-semibold text-wazifny-navy">
                  {testimonial.name}
                </p>
                <p className="text-sm text-slate-400">{t(testimonial.role)}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
