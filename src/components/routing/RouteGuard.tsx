"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

type Role = "student" | "tutor" | "moderator" | "admin";

type AuthShape = ReturnType<typeof useAuth>;
type User = NonNullable<AuthShape["user"]>;

function hasRole(user: User, roles: Role[]) {
  return (
    (roles.includes("student") && !!user.is_student) ||
    (roles.includes("tutor") && !!user.is_tutor) ||
    (roles.includes("moderator") && !!user.is_moderator) ||
    (roles.includes("admin") && !!user.is_admin)
  );
}

function DefaultLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

type GuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
  redirectAuthedTo?: string;
  roles?: Role[];
  loadingFallback?: React.ReactNode;
};

function Guard({
  children,
  redirectTo,
  redirectAuthedTo,
  roles,
  loadingFallback,
}: GuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isLoggedIn } = useAuth();

  const allowed = useMemo(() => {
    if (!isLoggedIn || !user) return false;
    if (!roles || roles.length === 0) return true;
    return hasRole(user, roles);
  }, [isLoggedIn, user, roles]);

  useEffect(() => {
    if (loading) return;

    if (redirectAuthedTo && isLoggedIn) {
      if (pathname !== redirectAuthedTo) router.replace(redirectAuthedTo);
      return;
    }

    if (redirectTo && !isLoggedIn) {
      if (pathname !== redirectTo) router.replace(redirectTo);
      return;
    }

    if (roles && roles.length > 0 && isLoggedIn && user && !allowed) {
      router.replace("/forbidden");
    }
  }, [loading, redirectAuthedTo, isLoggedIn, redirectTo, roles, allowed, pathname, router, user]);

  if (loading) return loadingFallback ?? <DefaultLoading />;

  if (redirectAuthedTo) {
    if (isLoggedIn) return null;
    return <>{children}</>;
  }

  if (redirectTo) {
    if (!isLoggedIn) return null;
    if (roles && roles.length > 0) return allowed ? <>{children}</> : null;
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function PublicRoute({
  children,
  redirectAuthedTo,
  loadingFallback,
}: {
  children: React.ReactNode;
  redirectAuthedTo?: string;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <Guard redirectAuthedTo={redirectAuthedTo} loadingFallback={loadingFallback}>
      {children}
    </Guard>
  );
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  loadingFallback,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <Guard redirectTo={redirectTo} loadingFallback={loadingFallback}>
      {children}
    </Guard>
  );
}

export function AdminRoute({
  children,
  redirectTo = "/login",
  loadingFallback,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <Guard redirectTo={redirectTo} roles={["admin"]} loadingFallback={loadingFallback}>
      {children}
    </Guard>
  );
}

export function RoleRoute({
  children,
  roles,
  redirectTo = "/login",
  loadingFallback,
}: {
  children: React.ReactNode;
  roles: Role[];
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
}) {
  return (
    <Guard redirectTo={redirectTo} roles={roles} loadingFallback={loadingFallback}>
      {children}
    </Guard>
  );
}



// import AdminRoute from "@/components/routing/AdminRoute";

// export default function AdminPage() {
//   return (
//     <AdminRoute>
//       <div>Admin content</div>
//     </AdminRoute>
//   );
// }


// "use client";

// import { ProtectedRoute } from "@/components/routing/guards";

// function Dashboard() {
//   return <div>Dashboard</div>;
// }

// export default function DashboardPage() {
//   return (
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   );
// }


// "use client";

// import { PublicRoute } from "@/components/routing/guards";

// export default function LoginPage() {
//   return (
//     <PublicRoute redirectAuthedTo="/dashboard">
//       <div>Login UI</div>
//     </PublicRoute>
//   );
// }