"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Clock, ExternalLink, Loader2, Search, Sparkles, Star } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getCourses, type Course } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const COURSE_IMAGES: Record<string, string> = {
  React: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&q=80",
  AWS: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  Python: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
  Docker: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=900&q=80",
  GraphQL: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
  "System Design": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  Figma: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=900&q=80",
  Product: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
};

export default function PublicCoursesPage() {
  const { token, role, hydrate } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { hydrate(); getCourses().then(setCourses).finally(() => setLoading(false)); }, [hydrate]);
  const filtered = courses.filter((course) => `${course.title} ${course.provider} ${course.skill_tag}`.toLowerCase().includes(query.toLowerCase()));
  const personalHref = token && role === "talent" ? "/talent/courses" : "/login";
  return <main className="min-h-screen bg-slate-50"><Navbar /><section className="bg-wazifny-navy py-12 text-white sm:py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Courses & Upskilling</span><h1 className="mt-4 text-3xl font-bold sm:text-4xl">Invest in your skills</h1><p className="mt-3 max-w-xl text-slate-300">Build job-ready skills with trusted learning providers. Sign in as a talent for an AI skill-gap analysis tailored to your profile.</p><Link href={personalHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-wazifny-green px-4 py-2.5 text-sm font-semibold text-white"><Sparkles className="h-4 w-4" />Your AI learning plan</Link></div></section><section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"><label className="flex max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search className="h-4 w-4 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses by skill or topic" className="w-full py-3 text-sm outline-none" /></label>{loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-wazifny-green" /></div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((course) => <article key={course.id} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card"><div className="relative h-40 overflow-hidden bg-wazifny-navy"><img src={COURSE_IMAGES[course.skill_tag] || COURSE_IMAGES.Product} alt="" loading="lazy" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-wazifny-navy/65 to-transparent"/><BookOpen className="absolute bottom-4 left-5 h-8 w-8 text-white" /></div><div className="p-5"><p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 w-fit">{course.skill_tag}</p><h2 className="mt-3 font-semibold text-wazifny-navy">{course.title}</h2><p className="text-sm text-slate-400">{course.provider}</p><div className="mt-3 flex gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration_weeks} weeks</span><span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-wazifny-orange" />{course.rating}</span></div>{course.url ? <a href={course.url} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-wazifny-green py-2 text-center text-sm font-semibold text-white hover:bg-wazifny-green-dark">View course <ExternalLink className="h-4 w-4" /></a> : <p className="mt-5 rounded-lg bg-slate-100 py-2 text-center text-sm text-slate-500">Course link coming soon</p>}</div></article>)}</div>}{!loading && !filtered.length && <p className="py-16 text-center text-slate-400">No courses match that search.</p>}</section><Footer /></main>;
}
