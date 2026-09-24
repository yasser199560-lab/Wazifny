"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FilePlus, Loader2 } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { createJob, type JobCreate } from "@/lib/api";
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

export default function PostJobPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", category: "", job_type: "full_time", location: "",
    salary_min: "", salary_max: "",
    description: "", requirements: "",
    application_method: "in_platform" as "in_platform" | "external",
    external_url: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canProceedStep0 = form.title.trim() && form.category && form.location.trim();
  const canProceedStep1 = form.description.trim();

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
        requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
      };
      const job = await createJob(token, payload);
      router.push(`/jobs/${job.id}`);
    } catch {
      setError("Couldn't publish the job. Please check the fields and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <EmployerShell>
      <div className="flex items-center gap-2">
        <FilePlus className="h-6 w-6 text-wazifny-green" />
        <h1 className="text-2xl font-bold text-wazifny-navy">Post a Job</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Fill in the details to attract the right candidates</p>

      <div className="mt-6 flex items-center gap-3">
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
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
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
              <Field label="Min Salary ($/mo)">
                <input value={form.salary_min} onChange={(e) => update("salary_min", e.target.value)} placeholder="2000" className={inputClass} />
              </Field>
              <Field label="Max Salary ($/mo)">
                <input value={form.salary_max} onChange={(e) => update("salary_max", e.target.value)} placeholder="4000" className={inputClass} />
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
            <Field label="Requirements (one per line)">
              <textarea
                rows={5}
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder={"5+ years React\nTypeScript\nStrong communication skills"}
                className={inputClass}
              />
            </Field>
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
                  value={form.external_url}
                  onChange={(e) => update("external_url", e.target.value)}
                  placeholder="https://yourcompany.com/careers/job"
                  className={inputClass + " mt-3"}
                />
              )}
            </div>

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
                Publish Job
              </button>
            </div>
          </div>
        )}
      </div>
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
