import type { ReactNode } from "react";
import ModeratorGuard from "./ModeratorGuard";
import DashboardShell from "./DashboardShell";


export default function ModeratorLayout({ children }: { children: ReactNode }) {
  return (
    <ModeratorGuard>
      <DashboardShell>{children}</DashboardShell>
    </ModeratorGuard>
  );
}