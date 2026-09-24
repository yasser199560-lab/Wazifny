"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
    } finally {
      // Always show the same success state, whether or not the email is
      // registered — this endpoint never reveals that, by design.
      setIsSubmitting(false);
      setSubmitted(true);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      await forgotPassword(email);
      setResent(true);
    } finally {
      setIsResending(false);
    }
  }

  if (submitted) {
    return (
      <AuthShell>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-wazifny-green" />
          <h1 className="mt-4 text-xl font-bold text-wazifny-navy">Check your email</h1>
          <p className="mt-2 text-sm text-slate-500">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
            link to reset your password. It expires in 1 hour.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resent}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-wazifny-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
            {resent ? "Reset link resent" : "Resend reset link"}
          </button>
          {resent && (
            <p className="mt-2 text-xs text-slate-500">Please use the newest reset email.</p>
          )}
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-wazifny-green hover:underline">
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-center text-2xl font-bold text-wazifny-navy">Forgot your password?</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-wazifny-navy">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-wazifny-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-wazifny-navy-light disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Reset Link
        </button>

        <p className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-medium text-wazifny-green hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
