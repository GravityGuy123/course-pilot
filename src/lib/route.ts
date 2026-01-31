import type { User } from "@/context/auth-context";

export function getDashboardPath(user: User | null): string {
  if (!user) return "/dashboard";

  if (user.is_admin) return "/dashboard/admin";
  if (user.is_moderator) return "/dashboard/moderator";
  if (user.is_tutor) return "/dashboard/tutor";
  if (user.is_student) return "/dashboard/student";

  return "/dashboard";
}