"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, Clock, ExternalLink, Loader2, Search, Sparkles, Star, X } from "lucide-react";
import TalentShell from "@/components/talent/TalentShell";
import { getCourses, getSkillGap, type Course, type SkillGapResponse } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const SEVERITY_COLOR: Record<string, string> = {
  "High Gap": "bg-red-50 text-red-500",
  "Medium Gap": "bg-orange-50 text-wazifny-orange",
  "Low Gap": "bg-wazifny-green/10 text-wazifny-green",
};

const SEVERITY_BAR: Record<string, string> = {
  "High Gap": "bg-red-400",
  "Medium Gap": "bg-wazifny-orange",
  "Low Gap": "bg-wazifny-green",
};

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

function CourseCard({ course, badge, onView }: { course: Course; badge?: string; onView: (course: Course) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card">
      <div className="relative h-36 overflow-hidden bg-wazifny-navy">
        <img src={COURSE_IMAGES[course.skill_tag] || COURSE_IMAGES.Product} alt="" loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-wazifny-navy/70 to-transparent" />
        <BookOpen className="absolute bottom-4 left-4 h-8 w-8 text-white" />
      </div>
      <div className="p-4">
        {badge && (
          <span className="mb-2 inline-block rounded-full bg-wazifny-green/10 px-2.5 py-1 text-xs font-semibold text-wazifny-green">
            {badge}
          </span>
        )}
        <h3 className="font-semibold text-wazifny-navy">{course.title}</h3>
        <p className="text-sm text-slate-400">{course.provider}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.duration_weeks} weeks
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current text-wazifny-orange" /> {course.rating}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => onView(course)} className="rounded-lg border border-wazifny-green px-3 py-2 text-sm font-semibold text-wazifny-green hover:bg-wazifny-green/5">View course</button>
          {course.url ? <a href={course.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-lg bg-wazifny-green px-3 py-2 text-sm font-semibold text-white hover:bg-wazifny-green-dark">Start <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm text-slate-500">Coming soon</span>}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const token = useAuthStore((s) => s.token);
  const [courses, setCourses] = useState<Course[]>([]);
  const [gap, setGap] = useState<SkillGapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([getCourses(), getSkillGap(token)])
      .then(([c, g]) => {
        setCourses(c);
        setGap(g);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <TalentShell>
      <h1 className="text-2xl font-bold text-wazifny-navy">Courses & Skill Gaps</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gaps identified from your skills vs. real job postings, with recommended courses
      </p>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : (
        <>
          {gap && gap.gaps.length > 0 && (
            <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-wazifny-orange" />
                  <h2 className="font-semibold text-wazifny-navy">Skill Gap Analysis</h2>
                </div>
                {gap.ai_generated && (
                  <span className="flex items-center gap-1 rounded-full bg-wazifny-green/10 px-2.5 py-1 text-xs font-semibold text-wazifny-green">
                    <Sparkles className="h-3 w-3" /> AI Generated
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-4">
                {gap.gaps.map((g) => (
                  <div key={g.skill}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-wazifny-navy">
                        {g.skill}{" "}
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[g.severity]}`}>
                          {g.severity}
                        </span>
                      </span>
                      <span className="text-slate-400">{g.jobs_requiring} jobs require this</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${SEVERITY_BAR[g.severity]}`}
                        style={{ width: g.severity === "High Gap" ? "85%" : g.severity === "Medium Gap" ? "55%" : "25%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gap && gap.recommended_courses.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-wazifny-green">
                <Sparkles className="h-4 w-4" /> Recommended for You
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gap.recommended_courses.map((c) => (
                  <CourseCard key={c.id} course={c} badge="AI Recommended" onView={setSelectedCourse} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">All Courses</h2>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses or skills" className="w-52 py-2 outline-none" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.filter((c) => `${c.title} ${c.provider} ${c.skill_tag}`.toLowerCase().includes(query.toLowerCase())).map((c) => (
                <CourseCard key={c.id} course={c} onView={setSelectedCourse} />
              ))}
            </div>
          </div>
        </>
      )}
      {selectedCourse && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex h-32 items-center justify-center bg-gradient-to-br from-wazifny-green to-wazifny-navy"><BookOpen className="h-10 w-10 text-white/80" /></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-wazifny-green">{selectedCourse.provider}</p><h2 className="mt-1 text-2xl font-bold text-wazifny-navy">{selectedCourse.title}</h2></div><button onClick={() => setSelectedCourse(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div><p className="mt-4 text-slate-600">Develop practical {selectedCourse.skill_tag} skills with this {selectedCourse.duration_weeks}-week course, rated {selectedCourse.rating}/5 by learners.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setSelectedCourse(null)} className="rounded-lg border px-4 py-2 font-medium text-wazifny-navy">Close</button>{selectedCourse.url && <a href={selectedCourse.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-wazifny-green px-4 py-2 font-semibold text-white">Start course <ExternalLink className="h-4 w-4" /></a>}</div></div></div></div>}
    </TalentShell>
  );
}
