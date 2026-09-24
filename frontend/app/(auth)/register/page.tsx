"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, User, Building2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { ApiError, applyToJob, register } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

type Role = "talent" | "employer";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const initialRole: Role = searchParams.get("role") === "employer" ? "employer" : "talent";
  const [role, setRole] = useState<Role>(initialRole);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== rePassword) {
      setError("Passwords do not match.");
      return;
    }
    if (role === "employer" && !companyName.trim()) {
      setError("Company name is required for an employer account.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email,
        password,
        role,
        ...(role === "employer" ? { company_name: companyName.trim() } : {}),
      });
      setSession({
        token: res.access_token,
        role: res.role,
        fullName: res.full_name,
        email: res.email,
      });

      const nextJobId = searchParams.get("next");
      if (nextJobId && res.role === "talent") {
        // They came here specifically to apply to a job (guests can't
        // apply without an account) — finish that now, then land them back
        // on Find Jobs with a success banner via the `apply` param.
        try {
          await applyToJob(res.access_token, nextJobId);
        } catch {
          // Already applied, or a transient error — either way, don't block
          // them from reaching the site.
        }
        router.push(`/jobs?apply=${nextJobId}`);
        return;
      }

      router.push(res.role === "admin" ? "/overview" : "/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-center text-2xl font-bold text-wazifny-navy">
        Create a Free Wazifny Account
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("talent")}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            role === "talent"
              ? "bg-wazifny-green text-white"
              : "bg-wazifny-green/10 text-wazifny-green"
          }`}
        >
          <User className="h-4 w-4" />
          Talent
        </button>
        <button
          type="button"
          onClick={() => setRole("employer")}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            role === "employer"
              ? "bg-wazifny-green text-white"
              : "bg-wazifny-green/10 text-wazifny-green"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Employer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-wazifny-navy">
              First Name
            </label>
            <input
              id="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-wazifny-navy">
              Last Name
            </label>
            <input
              id="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            />
          </div>
        </div>

        {role === "employer" && (
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-wazifny-navy">
              Company Name
            </label>
            <input
              id="companyName"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Ltd."
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            />
          </div>
        )}

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
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-wazifny-navy">
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="rePassword" className="block text-sm font-medium text-wazifny-navy">
            Re-Password
          </label>
          <input
            id="rePassword"
            type={showPassword ? "text" : "password"}
            required
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
            placeholder="Re-Password"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-wazifny-navy placeholder:text-slate-400 focus:border-wazifny-green focus:outline-none focus:ring-1 focus:ring-wazifny-green"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-wazifny-green px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-wazifny-green-dark disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create {role === "talent" ? "Talent" : "Employer"} Account
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-wazifny-green hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400">
          By registering, you agree to our{" "}
          <Link href="/terms" className="text-wazifny-green hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-wazifny-green hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
