"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import {
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  Users,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

type DashboardItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  condition: boolean;
};

interface PagesProps {
  onLinkClick?: () => void;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardPages({ onLinkClick }: PagesProps) {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;

  const hasAnyRole =
    !!user?.is_student ||
    !!user?.is_tutor ||
    !!user?.is_moderator ||
    !!user?.is_admin;

  const dashboards: DashboardItem[] = [
    {
      title: "General Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      condition: !hasAnyRole,
    },
    {
      title: "Student Dashboard",
      url: "/dashboard/student",
      icon: GraduationCap,
      condition: !!user?.is_student,
    },
    {
      title: "Tutor Dashboard",
      url: "/dashboard/tutor",
      icon: Users,
      condition: !!user?.is_tutor,
    },
    {
      title: "Moderator Dashboard",
      url: "/dashboard/moderator",
      icon: ShieldCheck,
      condition: !!user?.is_moderator,
    },
    {
      title: "Admin Dashboard",
      url: "/dashboard/admin",
      icon: UserCog,
      condition: !!user?.is_admin,
    },
  ];

  const visibleDashboards = dashboards.filter((d) => d.condition);

  if (visibleDashboards.length === 0) return null;

  return (
    <div className="flex flex-col mb-6">
      <span className="text-base font-bold uppercase tracking-wider text-violet-400 dark:text-indigo-200 px-3 mt-6 mb-2">
        Dashboards
      </span>

      <nav className="flex flex-col space-y-1 px-3">
        {visibleDashboards.map((item) => {
          const isActive =
            pathname === item.url || pathname.startsWith(item.url + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onLinkClick}
              className={cx(
                "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                isActive
                  ? "bg-violet-400 text-white dark:bg-violet-600 dark:text-white"
                  : "text-violet-400 hover:bg-violet-100 dark:text-gray-300 dark:hover:bg-violet-700"
              )}
            >
              {/* Active indicator */}
              <span
                className={cx(
                  "h-2 w-2 rounded-full transition",
                  isActive
                    ? "bg-emerald-500"
                    : "bg-transparent group-hover:bg-emerald-400/50"
                )}
                aria-hidden="true"
              />

              {/* Icon */}
              <Icon
                className={cx(
                  "h-5 w-5 transition",
                  isActive ? "text-white" : "text-violet-400 dark:text-gray-300"
                )}
                aria-hidden="true"
              />

              {/* Label */}
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}