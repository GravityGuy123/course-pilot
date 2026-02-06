"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ModeratorGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isStaff = useMemo(() => Boolean(user?.is_admin || user?.is_moderator), [user]);

  useEffect(() => {
    if (loading) return;
    if (!isStaff) router.replace("/dashboard");
  }, [isStaff, loading, router]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="rounded-xl border p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-1/3 rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!isStaff) return null;
  return <>{children}</>;
}