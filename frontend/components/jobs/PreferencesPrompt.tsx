"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const CATEGORY_OPTIONS = [
  "Engineering",
  "Design",
  "Marketing",
  "Finance",
  "Product",
  "Data & AI",
  "Sales",
  "Operations",
];

interface Props {
  onSubmit: (payload: { skills: string[]; preferred_categories: string[] }) => Promise<void>;
  onDismiss: () => void;
}

export default function PreferencesPrompt({ onSubmit, onDismiss }: Props) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit() {
    setIsSaving(true);
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await onSubmit({ skills, preferred_categories: categories });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative rounded-xl border border-wazifny-green/30 bg-wazifny-green/5 p-6">
      <button
        onClick={onDismiss}
        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        aria-label={t("Dismiss")}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 text-wazifny-green">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-semibold">{t("Get AI-matched jobs")}</h3>
      </div>
      <p className="mt-1 max-w-xl text-sm text-slate-500">
        CV upload &amp; auto-parsing is coming soon — for now, tell us a bit
        about what you&apos;re looking for and we&apos;ll use AI to surface
        the jobs that fit you best.
      </p>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-wazifny-navy">
          {t("Which fields interest you?")}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                categories.includes(cat)
                  ? "border-wazifny-green bg-wazifny-green text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-wazifny-green/50"
              }`}
            >
              {t(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-wazifny-navy">
          {t("Your top skills (comma separated)")}
        </label>
        <input
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          placeholder={t("e.g. React, Figma, Financial Modeling, SQL")}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSaving || (categories.length === 0 && !skillsInput.trim())}
        className="mt-5 flex items-center gap-2 rounded-lg bg-wazifny-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wazifny-navy-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("Show my AI matches")}
      </button>
    </div>
  );
}
