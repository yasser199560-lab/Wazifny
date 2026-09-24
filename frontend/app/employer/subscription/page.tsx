"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Settings, Zap } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import { getSubscription, switchSubscription, type Subscription } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function SubscriptionPage() {
  const token = useAuthStore((s) => s.token);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getSubscription(token)
      .then(setSub)
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleSwitch(planId: string) {
    if (!token) return;
    setSwitching(planId);
    try {
      const updated = await switchSubscription(token, planId);
      setSub(updated);
    } finally {
      setSwitching(null);
    }
  }

  if (isLoading || !sub) {
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
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-wazifny-green" />
        <h1 className="text-2xl font-bold text-wazifny-navy">Subscription Management</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">Manage your plan and billing</p>

      <div className="mt-6 rounded-xl border border-wazifny-green/30 bg-wazifny-green/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-wazifny-navy">Current Plan: {sub.current_plan}</h2>
              <span className="rounded-full bg-wazifny-green px-2.5 py-0.5 text-xs font-semibold text-white">
                Active
              </span>
            </div>
            {sub.renews_at && (
              <p className="mt-1 text-sm text-slate-500">
                Renews {new Date(sub.renews_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
            <p className="mt-2 text-3xl font-bold text-wazifny-navy">
              ${sub.price}<span className="text-base font-normal text-slate-400">/month</span>
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sub.features.map((f) => (
            <p key={f} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="text-wazifny-green">✓</span> {f}
            </p>
          ))}
        </div>
      </div>

      <h2 className="mt-8 text-lg font-bold text-wazifny-navy">Compare Plans</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {sub.all_plans.map((plan) => {
          const isCurrent = plan.name === sub.current_plan;
          return (
            <div
              key={plan.plan_id}
              className={`relative rounded-xl border-2 bg-white p-6 shadow-card ${
                isCurrent ? "border-wazifny-green" : "border-slate-100"
              }`}
            >
              {isCurrent && (
                <span className="absolute right-4 top-4 rounded-full bg-wazifny-green px-2.5 py-0.5 text-xs font-semibold text-white">
                  Current
                </span>
              )}
              <h3 className="font-bold text-wazifny-navy">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-wazifny-navy">
                ${plan.price}<span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <div className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <p key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-wazifny-green">✓</span> {f}
                  </p>
                ))}
              </div>
              <button
                onClick={() => handleSwitch(plan.plan_id)}
                disabled={isCurrent || switching !== null}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                  isCurrent
                    ? "bg-slate-100 text-slate-400"
                    : "bg-wazifny-green text-white hover:bg-wazifny-green-dark"
                } disabled:opacity-60`}
              >
                {switching === plan.plan_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current Plan"
                ) : (
                  <>Switch to {plan.name} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-wazifny-orange/30 bg-wazifny-orange/5 p-5">
        <Zap className="h-5 w-5 shrink-0 text-wazifny-orange" />
        <div>
          <p className="font-semibold text-wazifny-navy">Phase 2: AI Candidate Screening — Coming Soon</p>
          <p className="mt-1 text-sm text-slate-500">
            Enterprise plan subscribers will get early access to AI-powered
            resume screening and automatic candidate ranking. Stay tuned for updates.
          </p>
        </div>
      </div>
    </EmployerShell>
  );
}
