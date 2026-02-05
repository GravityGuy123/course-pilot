"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ModeratorGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isStaff = Boolean(user?.is_admin || user?.is_moderator);
    if (!isStaff) router.replace("/dashboard");
  }, [loading, router, user]);

  if (loading) return null;
  return <>{children}</>;
}