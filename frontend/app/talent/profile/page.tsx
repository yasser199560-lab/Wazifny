"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import TalentShell from "@/components/talent/TalentShell";
import { COUNTRIES } from "@/lib/countries";
import {
  addEducation,
  addExperience,
  addSkill,
  clearTalentProfile,
  deleteEducation,
  deleteExperience,
  getMyTalentProfile,
  removeCv,
  removeSkill,
  updatePersonalInfo,
  uploadCv,
  type EducationEntry,
  type ExperienceEntry,
  type TalentMe,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function AiBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-wazifny-green/10 px-1.5 py-0.5 text-[10px] font-bold text-wazifny-green">
      <Sparkles className="h-2.5 w-2.5" /> AI
    </span>
  );
}

export default function ProfilePage() {
  const token = useAuthStore((s) => s.token);
  const [profile, setProfile] = useState<TalentMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState({
    phone: "", city: "", country: "", headline: "", dob: "", gender: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [showEduForm, setShowEduForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [eduForm, setEduForm] = useState({ degree: "", institution: "" });
  const [expForm, setExpForm] = useState({ job_title: "", company_name: "" });

  const [cvUploading, setCvUploading] = useState(false);
  const [cvRemoving, setCvRemoving] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [cvMessage, setCvMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    try {
      const p = await getMyTalentProfile(token);
      setProfile(p);
      setForm({
        phone: p.phone || "",
        city: p.city || "",
        country: p.country || "",
        headline: p.headline || "",
        dob: p.dob || "",
        gender: p.gender || "",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!clearDialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !cvRemoving) setClearDialogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearDialogOpen, cvRemoving]);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    try {
      // An empty HTML date input is "", while the API accepts a date or
      // null. Normalize all cleared optional fields before saving.
      const updated = await updatePersonalInfo(token, {
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        headline: form.headline.trim() || null,
        dob: form.dob || null,
        gender: form.gender || null,
      });
      setProfile(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCvUpload(file: File) {
    if (!token) return;
    setCvUploading(true);
    setCvMessage(null);
    try {
      const res = await uploadCv(token, file);
      setProfile(res.profile);
      setForm({
        phone: res.profile.phone || "",
        city: res.profile.city || "",
        country: res.profile.country || "",
        headline: res.profile.headline || "",
        dob: res.profile.dob || "",
        gender: res.profile.gender || "",
      });
      setCvMessage({ text: res.message, ok: res.parsed_ok });
    } catch {
      setCvMessage({ text: "Couldn't upload your CV. Please try again.", ok: false });
    } finally {
      setCvUploading(false);
    }
  }

  async function handleCvRemove() {
    if (!token || !profile) return;
    const confirmed = window.confirm(
      "Remove the uploaded CV and information extracted from it? Manually entered profile details and application records will be kept. Employers will no longer be able to open this CV."
    );
    if (!confirmed) return;

    setCvRemoving(true);
    setCvMessage(null);
    try {
      const updated = await removeCv(token);
      setProfile(updated);
      setForm({
        phone: updated.phone || "",
        city: updated.city || "",
        country: updated.country || "",
        headline: updated.headline || "",
        dob: updated.dob || "",
        gender: updated.gender || "",
      });
      setCvMessage({ text: "CV removed. Manually entered profile details and application records were kept.", ok: true });
    } catch (error) {
      setCvMessage({
        text: error instanceof Error ? error.message : "Couldn't remove your CV. Please try again.",
        ok: false,
      });
    } finally {
      setCvRemoving(false);
    }
  }

  async function handleClearAllProfileData() {
    if (!token) return;
    setClearDialogOpen(false);
    setCvRemoving(true);
    setCvMessage(null);
    try {
      const updated = await clearTalentProfile(token);
      setProfile(updated);
      setForm({ phone: "", city: "", country: "", headline: "", dob: "", gender: "" });
      setCvMessage({ text: "All talent profile data was cleared. Your account and application records remain.", ok: true });
    } catch (error) {
      setCvMessage({
        text: error instanceof Error ? error.message : "Couldn't clear your profile. Please try again.",
        ok: false,
      });
    } finally {
      setCvRemoving(false);
    }
  }

  async function handleAddSkill() {
    if (!token || !newSkill.trim()) return;
    const updated = await addSkill(token, newSkill.trim());
    setProfile(updated);
    setNewSkill("");
  }

  async function handleRemoveSkill(skill: string) {
    if (!token) return;
    const updated = await removeSkill(token, skill);
    setProfile(updated);
  }

  async function handleAddEducation() {
    if (!token || !eduForm.degree.trim() || !eduForm.institution.trim()) return;
    const entry: EducationEntry = await addEducation(token, eduForm);
    setProfile((p) => (p ? { ...p, education: [...p.education, entry] } : p));
    setEduForm({ degree: "", institution: "" });
    setShowEduForm(false);
  }

  async function handleDeleteEducation(id?: string) {
    if (!token || !id) return;
    await deleteEducation(token, id);
    setProfile((p) => (p ? { ...p, education: p.education.filter((e) => e.id !== id) } : p));
  }

  async function handleAddExperience() {
    if (!token || !expForm.job_title.trim() || !expForm.company_name.trim()) return;
    const entry: ExperienceEntry = await addExperience(token, expForm);
    setProfile((p) => (p ? { ...p, experience: [...p.experience, entry] } : p));
    setExpForm({ job_title: "", company_name: "" });
    setShowExpForm(false);
  }

  async function handleDeleteExperience(id?: string) {
    if (!token || !id) return;
    await deleteExperience(token, id);
    setProfile((p) => (p ? { ...p, experience: p.experience.filter((e) => e.id !== id) } : p));
  }

  if (isLoading || !profile) {
    return (
      <TalentShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      </TalentShell>
    );
  }

  const aiFields = new Set(profile.ai_filled_fields);
  const hasAiAutofill =
    profile.ai_filled_fields.length > 0 ||
    profile.education.some((entry) => entry.source === "ai_cv") ||
    profile.experience.some((entry) => entry.source === "ai_cv");
  const hasProfileData = Boolean(
    profile.cv_filename || profile.phone || profile.city || profile.country || profile.headline || profile.dob ||
    profile.gender || profile.skills.length || profile.education.length || profile.experience.length ||
    profile.preferred_categories.length
  );

  return (
    <TalentShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wazifny-navy">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your profile complete to unlock AI job matching
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || cvRemoving}
          className="rounded-lg bg-wazifny-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-wazifny-green-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : savedMsg ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {saveError && <p className="mt-3 text-right text-xs text-red-600">{saveError}</p>}

      {/* Completion */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-wazifny-navy">
            Profile Completion{" "}
            <span className="text-wazifny-orange">{profile.profile_completion_percent}%</span>
          </p>
          {profile.profile_completion_status !== "complete" && (
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-wazifny-orange">
              Incomplete — AI matching may be limited
            </span>
          )}
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-wazifny-green transition-all"
            style={{ width: `${profile.profile_completion_percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Complete your info, education, experience, and skills to improve AI matching.
        </p>
      </div>

      {/* CV / Resume — real upload + AI autofill */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-wazifny-navy">CV / Resume</p>
          {hasAiAutofill && (
            <span className="flex items-center gap-1 rounded-full bg-wazifny-green/10 px-2.5 py-1 text-xs font-semibold text-wazifny-green">
              <Sparkles className="h-3 w-3" /> AI Autofilled
            </span>
          )}
        </div>

        {profile.cv_filename ? (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-wazifny-navy">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>{profile.cv_filename}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={cvUploading || cvRemoving}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-wazifny-navy hover:bg-white disabled:opacity-60"
              >
                {cvUploading ? "Uploading..." : "Re-upload"}
              </button>
              <button
                onClick={handleCvRemove}
                disabled={cvUploading || cvRemoving}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {cvRemoving ? "Removing..." : "Remove CV"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={cvUploading || cvRemoving}
              className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-8 text-slate-400 hover:border-wazifny-green hover:text-wazifny-green disabled:opacity-60"
            >
              {cvUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
              <span className="text-sm font-medium">
                {cvUploading ? "Reading your CV..." : "Upload your CV (PDF or DOCX)"}
              </span>
              <span className="text-xs">AI will auto-fill your profile from it</span>
            </button>
          </>
        )}

        {hasProfileData && (
          <button
            onClick={() => setClearDialogOpen(true)}
            disabled={cvUploading || cvRemoving}
            className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Clear all profile data
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCvUpload(file);
            e.target.value = "";
          }}
        />

        {cvMessage && (
          <p
            className={`mt-3 flex items-start gap-1.5 text-sm ${
              cvMessage.ok ? "text-wazifny-green" : "text-wazifny-orange"
            }`}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {cvMessage.text}
          </p>
        )}
      </div>

      {clearDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setClearDialogOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-profile-title"
            aria-describedby="clear-profile-warning"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="clear-profile-title" className="text-lg font-bold text-red-700">Clear all profile data?</h2>
            <p id="clear-profile-warning" className="mt-3 text-sm leading-6 text-slate-600">
              Continuing permanently removes your CV, profile details, education, experience, skills, and preferences from Wazifny. Companies you applied to will no longer see this profile information here. We cannot remove copies an employer may already have downloaded or saved outside Wazifny.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setClearDialogOpen(false)}
                disabled={cvRemoving}
                autoFocus
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllProfileData}
                disabled={cvRemoving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cvRemoving ? "Clearing..." : "Continue"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Personal Info */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-wazifny-navy">Personal Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <input disabled value={profile.full_name} className={inputClass + " bg-slate-50 text-slate-400"} />
          </Field>
          <Field label="Email">
            <input disabled value={profile.email} className={inputClass + " bg-slate-50 text-slate-400"} />
          </Field>
          <Field label="Phone" ai={aiFields.has("phone")}>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputClass}
              placeholder="+961 ..."
            />
          </Field>
          <Field label="Headline" ai={aiFields.has("headline")}>
            <input
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Frontend Developer"
            />
          </Field>
          <Field label="City" ai={aiFields.has("city")}>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className={inputClass}
              placeholder="Beirut"
            />
          </Field>
          <Field label="Country" ai={aiFields.has("country")}>
            <select
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select a country...</option>
              {form.country && !COUNTRIES.some((country) => country.name === form.country) && (
                <option value={form.country}>{form.country}</option>
              )}
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date of Birth">
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Gender">
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Education */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-wazifny-navy">Education</h2>
          <button
            onClick={() => setShowEduForm((v) => !v)}
            className="flex items-center gap-1 text-sm font-medium text-wazifny-green hover:underline"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {showEduForm && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50 p-4 sm:flex-row">
            <input
              value={eduForm.degree}
              onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))}
              placeholder="Degree (e.g. B.Sc. Computer Science)"
              className={inputClass}
            />
            <input
              value={eduForm.institution}
              onChange={(e) => setEduForm((f) => ({ ...f, institution: e.target.value }))}
              placeholder="Institution"
              className={inputClass}
            />
            <button
              onClick={handleAddEducation}
              className="shrink-0 rounded-lg bg-wazifny-navy px-4 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {profile.education.map((edu) => (
            <div
              key={edu.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="flex items-center font-medium text-wazifny-navy">
                  {edu.degree}
                  {edu.source === "ai_cv" && <AiBadge />}
                </p>
                <p className="text-sm text-slate-400">{edu.institution}</p>
              </div>
              <button
                onClick={() => handleDeleteEducation(edu.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {profile.education.length === 0 && !showEduForm && (
            <p className="text-sm text-slate-400">No education added yet.</p>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-wazifny-navy">Work Experience</h2>
          <button
            onClick={() => setShowExpForm((v) => !v)}
            className="flex items-center gap-1 text-sm font-medium text-wazifny-green hover:underline"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {showExpForm && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50 p-4 sm:flex-row">
            <input
              value={expForm.job_title}
              onChange={(e) => setExpForm((f) => ({ ...f, job_title: e.target.value }))}
              placeholder="Job title"
              className={inputClass}
            />
            <input
              value={expForm.company_name}
              onChange={(e) => setExpForm((f) => ({ ...f, company_name: e.target.value }))}
              placeholder="Company"
              className={inputClass}
            />
            <button
              onClick={handleAddExperience}
              className="shrink-0 rounded-lg bg-wazifny-navy px-4 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {profile.experience.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="flex items-center font-medium text-wazifny-navy">
                  {exp.job_title}
                  {exp.source === "ai_cv" && <AiBadge />}
                </p>
                <p className="text-sm text-slate-400">{exp.company_name}</p>
              </div>
              <button
                onClick={() => handleDeleteExperience(exp.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {profile.experience.length === 0 && !showExpForm && (
            <p className="text-sm text-slate-400">No experience added yet.</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-wazifny-navy">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-full bg-wazifny-green/10 px-3 py-1.5 text-sm font-medium text-wazifny-green"
            >
              {skill}
              <button onClick={() => handleRemoveSkill(skill)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            placeholder="Add a skill..."
            className={inputClass + " max-w-xs"}
          />
          <button
            onClick={handleAddSkill}
            className="rounded-lg bg-wazifny-navy px-4 py-2 text-sm font-semibold text-white"
          >
            Add Skill
          </button>
        </div>
      </div>
    </TalentShell>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green";

function Field({ label, children, ai }: { label: string; children: React.ReactNode; ai?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center text-sm font-medium text-wazifny-navy">
        {label}
        {ai && <AiBadge />}
      </label>
      {children}
    </div>
  );
}
