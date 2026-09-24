"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { dashboardPathForRole } from "@/store/authStore";

export default function DashboardRedirectPage() {
  const { user, status } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "ready" && user) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [status, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
    </div>
  );
}
