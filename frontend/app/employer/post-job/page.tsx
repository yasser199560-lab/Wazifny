"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FilePlus, Loader2, Sparkles } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { analyzeJobPostImage, createJob, deleteJobDraft, getJobDraft, getMyJob, saveJobDraft, updateJob, type JobCreate, type JobDraft } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const CATEGORY_OPTIONS = [
  "Engineering", "Design", "Marketing", "Finance", "Product", "Data & AI", "Sales", "Operations",
];
const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "remote", label: "Remote" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
];

const STEPS = ["Job Details", "Description & Requirements", "Application Settings"];
const EMPTY_FORM: JobDraft = {
  title: "", category: "", job_type: "full_time", location: "", salary_min: "", salary_max: "",
  description: "", company_description: "", employment_level: "", work_arrangement: "", working_hours: "",
  responsibilities: "", requirements: "", nice_to_have: "", benefits: "", application_method: "in_platform",
  external_url: "", application_instructions: "", application_deadline: "",
};

export default function PostJobPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.email);
  const [step, setStep] = useState(0);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisMessage, setImageAnalysisMessage] = useState<string | null>(null);
  const draftSaveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const [form, setForm] = useState<JobDraft>(EMPTY_FORM);

  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (editId) setEditingJobId(editId);
  }, []);

  useEffect(() => {
    if (!token || !editingJobId) return;
    setError(null);
    setIsLoadingJob(true);
    getMyJob(token, editingJobId)
      .then((job) => {
        const salaryParts = job.salary?.match(/\$?([\d,]+)\s*-\s*\$?([\d,?]+)/);
        setForm({
          title: job.title,
          category: job.category,
          job_type: job.job_type,
          location: job.location,
          salary_min: salaryParts?.[1]?.replaceAll(",", "") ?? "",
          salary_max: salaryParts?.[2]?.replaceAll(",", "") ?? "",
          description: job.description ?? "",
          company_description: job.company_description ?? "",
          employment_level: job.employment_level ?? "",
          work_arrangement: job.work_arrangement ?? "",
          working_hours: job.working_hours ?? "",
          responsibilities: (job.responsibilities ?? []).join("\n"),
          requirements: job.requirements.join("\n"),
          nice_to_have: (job.nice_to_have ?? []).join("\n"),
          benefits: (job.benefits ?? []).join("\n"),
          application_method: job.application_method,
          external_url: job.external_url ?? "",
          application_instructions: job.application_instructions ?? "",
          application_deadline: job.application_deadline ?? "",
        });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load this job."))
      .finally(() => setIsLoadingJob(false));
  }, [token, editingJobId]);

  useEffect(() => {
    if (!token || editingJobId) return;
    let cancelled = false;
    const localKey = userId ? `wazifny:job-draft:${userId}` : null;
    let hasLocalDraft = false;
    if (localKey) {
      try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Partial<JobDraft>;
          setForm({ ...EMPTY_FORM, ...parsed });
          hasLocalDraft = true;
        }
      } catch {
        localStorage.removeItem(localKey);
      }
    }
    getJobDraft(token)
      .then((draft) => {
        if (!cancelled && !hasLocalDraft) setForm({ ...EMPTY_FORM, ...draft });
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your saved draft. Your changes will still be saved on this device.");
      })
      .finally(() => { if (!cancelled) setDraftLoaded(true); });
    return () => { cancelled = true; };
  }, [token, editingJobId, userId]);

  useEffect(() => {
    if (!token || editingJobId || !draftLoaded || isSubmitting) return;
    const localKey = userId ? `wazifny:job-draft:${userId}` : null;
    if (localKey) {
      try { localStorage.setItem(localKey, JSON.stringify(form)); } catch { /* storage can be unavailable */ }
    }
    const timeout = window.setTimeout(() => {
      draftSaveQueue.current = draftSaveQueue.current
        .catch(() => undefined)
        .then(() => saveJobDraft(token, form))
        .then(() => setDraftSaved(true))
        .catch(() => setDraftSaved(false));
    }, 500);
    setDraftSaved(false);
    return () => window.clearTimeout(timeout);
  }, [form, token, editingJobId, draftLoaded, userId, isSubmitting]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function analyzeSelectedImage() {
    if (!token || !imageFile) return;
    setIsAnalyzingImage(true);
    setImageAnalysisMessage(null);
    try {
      const result = await analyzeJobPostImage(token, imageFile);
      setForm((current) => {
        const next = { ...current };
        for (const key of Object.keys(result.fields) as (keyof JobDraft)[]) {
          const suggestion = result.fields[key];
          if (!current[key].trim() && suggestion.trim()) {
            Object.assign(next, { [key]: suggestion });
          }
        }
        return next;
      });
      setStep(0);
      setImageAnalysisMessage("AI filled the blank fields it could read. Review and edit them before publishing.");
    } catch (reason) {
      setImageAnalysisMessage(reason instanceof Error ? reason.message : "Could not analyze this image. You can fill in the form manually.");
    } finally {
      setIsAnalyzingImage(false);
    }
  }

  const canProceedStep0 = form.title.trim() && form.category && form.location.trim();
  const canProceedStep1 = form.description.trim();

  if (editingJobId && error && !isLoadingJob) {
    return (
      <EmployerShell>
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        <Link href="/employer/manage-jobs" className="mt-4 inline-block text-sm font-medium text-wazifny-green hover:underline">Back to Manage Jobs</Link>
      </EmployerShell>
    );
  }

  async function handlePublish() {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const salary =
        form.salary_min || form.salary_max
          ? `$${form.salary_min || "0"} - $${form.salary_max || "?"}`
          : null;
      const payload: JobCreate = {
        title: form.title.trim(),
        category: form.category,
        location: form.location.trim(),
        salary,
        job_type: form.job_type,
        application_method: form.application_method,
        external_url: form.application_method === "external" ? form.external_url.trim() : null,
        description: form.description.trim(),
        company_description: form.company_description.trim(),
        employment_level: form.employment_level,
        work_arrangement: form.work_arrangement,
        working_hours: form.working_hours.trim(),
        responsibilities: form.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
        requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        nice_to_have: form.nice_to_have.split("\n").map((r) => r.trim()).filter(Boolean),
        benefits: form.benefits.split("\n").map((r) => r.trim()).filter(Boolean),
        application_instructions: form.application_instructions.trim(),
        application_deadline: form.application_deadline || null,
      };
      const job = editingJobId
        ? await updateJob(token, editingJobId, payload)
        : await createJob(token, payload);
      if (!editingJobId) {
        draftSaveQueue.current = draftSaveQueue.current
          .catch(() => undefined)
          .then(() => deleteJobDraft(token))
          .catch(() => undefined);
        await draftSaveQueue.current;
        if (userId) {
          try { localStorage.removeItem(`wazifny:job-draft:${userId}`); } catch { /* storage can be unavailable */ }
        }
      }
      router.push(editingJobId ? `/employer/manage-jobs/${job.id}` : `/jobs/${job.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn't save the job. Please check the fields and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <EmployerShell>
      <div className="flex items-center gap-2">
        <FilePlus className="h-6 w-6 text-wazifny-green" />
        <h1 className="text-2xl font-bold text-wazifny-navy">{editingJobId ? "Edit Job" : "Post a Job"}</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Fill in the details to attract the right candidates</p>
      {!editingJobId && draftLoaded && <p aria-live="polite" className="mt-2 text-xs text-slate-500">{draftSaved ? "Draft saved" : "Saving your draft…"}</p>}

      <section className="mt-6 rounded-xl border border-violet-100 bg-violet-50/70 p-5" aria-label="AI job post image autofill">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm"><Sparkles className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-wazifny-navy">Fill from a job post image</h2>
            <p className="mt-1 text-sm text-slate-600">Upload a clear JPEG, PNG, or WebP image (up to 3 MB). AI will suggest details for blank fields; you can review and edit everything.</p>
            <p className="mt-1 text-xs text-slate-500">The image is sent to Google Gemini, or Groq if Gemini is unavailable, for analysis and is not stored by Wazifny. You can also skip this and fill out the form as usual.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0] ?? null; setImageFile(selected); setImageAnalysisMessage(selected && selected.size > 3 * 1024 * 1024 ? "Please choose an image no larger than 3 MB." : null); }} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-medium file:text-wazifny-navy" aria-label="Choose job post image" />
              <button type="button" onClick={analyzeSelectedImage} disabled={!imageFile || imageFile.size > 3 * 1024 * 1024 || isAnalyzingImage} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
                {isAnalyzingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isAnalyzingImage ? "Analyzing…" : "Analyze image"}
              </button>
            </div>
            {imageFile && imageFile.size <= 3 * 1024 * 1024 && <p className="mt-2 text-xs text-slate-500">Selected: {imageFile.name}</p>}
            {imageAnalysisMessage && <p aria-live="polite" className="mt-2 text-sm text-slate-700">{imageAnalysisMessage}</p>}
          </div>
        </div>
      </section>

      {isLoadingJob && <div className="mt-6 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-wazifny-green" /></div>}

      {!isLoadingJob && <div className="mt-6 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= step ? "bg-wazifny-green text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}
            </span>
            {i === step && <span className="text-sm font-medium text-wazifny-navy">{label}</span>}
            {i < STEPS.length - 1 && <span className="h-px w-10 bg-slate-200" />}
          </div>
        ))}
      </div>}

      {!isLoadingJob && <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-wazifny-navy">Job Details</h2>
            <Field label="Job Title *">
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category *">
                <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  {form.category && !CATEGORY_OPTIONS.includes(form.category) && <option value={form.category}>{form.category}</option>}
                </select>
              </Field>
              <Field label="Job Type *">
                <select value={form.job_type} onChange={(e) => update("job_type", e.target.value)} className={inputClass}>
                  {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Location *">
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Beirut, Lebanon"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Experience level"><select value={form.employment_level} onChange={(e) => update("employment_level", e.target.value)} className={inputClass}><option value="">Select level</option>{["Entry level", "Junior", "Mid-level", "Senior", "Lead", "Director", "Executive"].map((value) => <option key={value}>{value}</option>)}{form.employment_level && !["Entry level", "Junior", "Mid-level", "Senior", "Lead", "Director", "Executive"].includes(form.employment_level) && <option value={form.employment_level}>{form.employment_level}</option>}</select></Field>
              <Field label="Work arrangement"><select value={form.work_arrangement} onChange={(e) => update("work_arrangement", e.target.value)} className={inputClass}><option value="">Select arrangement</option>{["On-site", "Hybrid", "Remote", "Worldwide / Remote"].map((value) => <option key={value}>{value}</option>)}{form.work_arrangement && !["On-site", "Hybrid", "Remote", "Worldwide / Remote"].includes(form.work_arrangement) && <option value={form.work_arrangement}>{form.work_arrangement}</option>}</select></Field>
            </div>
            <Field label="Working hours"><input value={form.working_hours} onChange={(e) => update("working_hours", e.target.value)} placeholder="e.g. Flexible hours, 9 AM–5 PM" className={inputClass} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Min Salary ($/mo)">
                <input type="number" min="0" value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} placeholder="2000" className={inputClass} />
              </Field>
              <Field label="Max Salary ($/mo)">
                <input type="number" min="0" value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} placeholder="4000" className={inputClass} />
              </Field>
            </div>
            <div className="flex justify-end">
              <button
                disabled={!canProceedStep0}
                onClick={() => setStep(1)}
                className="rounded-lg bg-wazifny-green px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-wazifny-navy">Description & Requirements</h2>
            <Field label="Job Description *">
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the role, responsibilities, and team culture..."
                className={inputClass}
              />
            </Field>
            <Field label="About the Company"><textarea rows={4} value={form.company_description} onChange={(e) => update("company_description", e.target.value)} placeholder="Introduce your team, mission, and work culture" className={inputClass} /></Field>
            <Field label="Responsibilities (one per line)"><textarea rows={5} value={form.responsibilities} onChange={(e) => update("responsibilities", e.target.value)} placeholder="Develop responsive applications\nCollaborate with the product team" className={inputClass} /></Field>
            <Field label="Requirements (one per line)">
              <textarea
                rows={5}
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder={"5+ years React\nTypeScript\nStrong communication skills"}
                className={inputClass}
              />
            </Field>
            <Field label="Nice to Have (one per line)"><textarea rows={4} value={form.nice_to_have} onChange={(e) => update("nice_to_have", e.target.value)} className={inputClass} /></Field>
            <Field label="What We Offer (one per line)"><textarea rows={4} value={form.benefits} onChange={(e) => update("benefits", e.target.value)} placeholder="Health coverage\nProfessional development" className={inputClass} /></Field>
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-wazifny-navy">
                Back
              </button>
              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="rounded-lg bg-wazifny-green px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-wazifny-navy">Application Settings</h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-wazifny-navy">Application Method *</label>
              <div className="space-y-3">
                <label
                  className={`block cursor-pointer rounded-lg border-2 p-4 ${
                    form.application_method === "in_platform" ? "border-wazifny-green bg-wazifny-green/5" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={form.application_method === "in_platform"}
                      onChange={() => update("application_method", "in_platform")}
                    />
                    <span className="font-semibold text-wazifny-navy">In-Platform Apply</span>
                    <span className="rounded-full bg-wazifny-green/10 px-2 py-0.5 text-xs font-semibold text-wazifny-green">
                      Recommended
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Candidates apply directly through Wazifny. Applications appear in your dashboard.
                  </p>
                </label>
                <label
                  className={`block cursor-pointer rounded-lg border-2 p-4 ${
                    form.application_method === "external" ? "border-wazifny-green bg-wazifny-green/5" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={form.application_method === "external"}
                      onChange={() => update("application_method", "external")}
                    />
                    <span className="font-semibold text-wazifny-navy">External Redirect</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Candidates are redirected to your website to complete the application.
                  </p>
                </label>
              </div>
              {form.application_method === "external" && (
                <input
                  type="url"
                  required
                  value={form.external_url}
                  onChange={(e) => update("external_url", e.target.value)}
                  placeholder="https://yourcompany.com/careers/job"
                  className={inputClass + " mt-3"}
                />
              )}
            </div>

            <Field label="How to Apply"><textarea rows={3} value={form.application_instructions} onChange={(e) => update("application_instructions", e.target.value)} placeholder="Tell candidates what to include with their application" className={inputClass} /></Field>
            <Field label="Application Deadline"><input type="date" value={form.application_deadline} onChange={(e) => update("application_deadline", e.target.value)} className={inputClass} /></Field>

            <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              <strong className="text-wazifny-navy">{form.title || "Job title"}</strong> · {form.location || "Location"} ·{" "}
              {JOB_TYPES.find((t) => t.value === form.job_type)?.label}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-wazifny-navy">
                Back
              </button>
              <button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-wazifny-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-wazifny-orange-dark disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {editingJobId ? "Save Changes" : "Publish Job"}
              </button>
            </div>
          </div>
        )}
      </div>}
    </EmployerShell>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-wazifny-navy">{label}</label>
      {children}
    </div>
  );
}
