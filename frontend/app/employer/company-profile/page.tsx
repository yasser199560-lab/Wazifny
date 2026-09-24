"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Globe, ImagePlus, Loader2 } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { companyImageUrl, getCompanyProfile, updateCompanyProfile, uploadCompanyImage, type CompanyProfile } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function CompanyProfilePage() {
  const token = useAuthStore((s) => s.token);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageBusy, setImageBusy] = useState<"logo" | "banner" | null>(null);
  const [error, setError] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    company_name: "", location: "", website: "", sector: "",
    workforce_size: "", lifecycle_stage: "", description: "",
  });

  useEffect(() => {
    if (!token) return;
    getCompanyProfile(token)
      .then((p) => {
        setProfile(p);
        setForm({
          company_name: p.company_name || "",
          location: p.location || "",
          website: p.website || "",
          sector: p.sector || "",
          workforce_size: p.workforce_size || "",
          lifecycle_stage: p.lifecycle_stage || "",
          description: p.description || "",
        });
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleSave() {
    if (!token) return;
    setError("");
    setSaving(true);
    try {
      const updated = await updateCompanyProfile(token, form);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save company details.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(kind: "logo" | "banner", file?: File) {
    if (!token || !file) return;
    setError("");
    setImageBusy(kind);
    try {
      await uploadCompanyImage(token, kind, file);
      setProfile(await getCompanyProfile(token));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setImageBusy(null);
    }
  }

  if (isLoading || !profile) {
    return (
      <EmployerShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      </EmployerShell>
    );
  }

  return (
    <EmployerShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wazifny-navy">Company Profile</h1>
          <p className="mt-1 text-sm text-slate-500">How talents see your company on Wazifny</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-wazifny-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-wazifny-green-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-wazifny-green to-wazifny-navy text-white/70">
          {profile.banner_url && <img src={companyImageUrl(profile.banner_url) ?? ""} alt="Company banner" className="absolute inset-0 h-full w-full object-cover" />}
          <button type="button" onClick={() => bannerInput.current?.click()} disabled={imageBusy !== null} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-wazifny-navy shadow disabled:opacity-60">
            {imageBusy === "banner" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload banner
          </button>
          <input ref={bannerInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { void handleImageUpload("banner", e.target.files?.[0]); e.currentTarget.value = ""; }} />
        </div>
        <div className="flex items-center gap-3 p-5">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-wazifny-green">{profile.logo_url ? <img src={companyImageUrl(profile.logo_url) ?? ""} alt="Company logo" className="h-full w-full object-contain p-1" /> : <Building2 className="h-6 w-6" />}</span>
          <div>
            <h2 className="text-lg font-bold text-wazifny-navy">{form.company_name || "Your Company"}</h2>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              {form.sector && <span className="rounded-full bg-slate-100 px-2.5 py-1">{form.sector}</span>}
              {form.location && <span className="rounded-full bg-slate-100 px-2.5 py-1">{form.location}</span>}
              {form.workforce_size && <span className="rounded-full bg-slate-100 px-2.5 py-1">{form.workforce_size} employees</span>}
            </div>
          </div>
          <button type="button" onClick={() => logoInput.current?.click()} disabled={imageBusy !== null} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-wazifny-navy disabled:opacity-60">
            {imageBusy === "logo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload logo
          </button>
          <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { void handleImageUpload("logo", e.target.files?.[0]); e.currentTarget.value = ""; }} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-wazifny-navy">Company Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company Name">
            <input value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className={inputClass} placeholder="Beirut, Lebanon" />
          </Field>
          <Field label="Website">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} className={inputClass} placeholder="https://yourcompany.com" />
            </div>
          </Field>
          <Field label="Sector">
            <input value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} className={inputClass} placeholder="Technology" />
          </Field>
          <Field label="Company Size">
            <select value={form.workforce_size} onChange={(e) => setForm((f) => ({ ...f, workforce_size: e.target.value }))} className={inputClass}>
              <option value="">Select...</option>
              {["1-10", "11-50", "51-200", "201-500", "500+"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Company Stage">
            <select value={form.lifecycle_stage} onChange={(e) => setForm((f) => ({ ...f, lifecycle_stage: e.target.value }))} className={inputClass}>
              <option value="">Select...</option>
              {["Startup", "Growth", "Established", "Enterprise"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Company Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-wazifny-green" />
          <div>
            <p className="font-semibold text-wazifny-navy">Profile Visibility</p>
            <p className="text-sm text-slate-400">Your profile is visible to talents on Wazifny</p>
          </div>
        </div>
        <span className="rounded-full bg-wazifny-green/10 px-3 py-1 text-xs font-semibold text-wazifny-green">
          {profile.is_hidden ? "Hidden" : "Public"}
        </span>
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
