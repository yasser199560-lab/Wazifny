"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { ApiError, resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token") || "";
  const [token, setToken] = useState(queryToken);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "This reset link is invalid or has expired."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-wazifny-green" />
          <h1 className="mt-4 text-xl font-bold text-wazifny-navy">Password updated</h1>
          <p className="mt-2 text-sm text-slate-500">Redirecting you to login...</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-center text-2xl font-bold text-wazifny-navy">Choose a new password</h1>
      {!queryToken && (
        <p className="mt-2 text-center text-sm text-slate-500">
          Paste the reset code from your email below if its button was blocked.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-wazifny-navy">Reset Code</label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-wazifny-navy focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            placeholder="Paste the code from your reset email"
            autoComplete="one-time-code"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-wazifny-navy">New Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-wazifny-navy">Confirm Password</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-wazifny-navy px-4 py-3 text-sm font-semibold text-white hover:bg-wazifny-navy-light disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Reset Password
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
