// src/components/shared/Pages.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  type LucideIcon,
  Home,
  GraduationCap,
  LayoutDashboard,
  Inbox,
  Users,
  Info,
  Mail,
  BadgeCheck,
  Headphones,
} from "lucide-react";
import { FiBookOpen, FiCheckSquare } from "react-icons/fi";
import { useAuth } from "@/context/auth-context";

type MenuItemType = {
  title: string;
  url: string;
  icon: LucideIcon | IconType;
  exact?: boolean;
};

interface PagesProps {
  onLinkClick?: () => void;
}

const guestNavigation: MenuItemType[] = [
  { title: "Home", url: "/", icon: Home, exact: true },
  { title: "Courses", url: "/courses", icon: GraduationCap },
  { title: "About", url: "/about", icon: Info, exact: true },
  { title: "Contact", url: "/contact", icon: Mail, exact: true },
];

const authNavigation: MenuItemType[] = [
  // ✅ only active on /dashboard exactly
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, exact: true },

  // ✅ active on /dashboard/inbox + /dashboard/inbox/[id]
  { title: "Inbox", url: "/dashboard/inbox", icon: Inbox },

  // Learning
  { title: "Enrollments", url: "/dashboard/enrollments", icon: BadgeCheck },
  { title: "Lessons", url: "/dashboard/student/lessons", icon: FiBookOpen },
  { title: "Tasks", url: "/dashboard/tasks", icon: FiCheckSquare },
  { title: "Groups", url: "/dashboard/groups", icon: Users },

  // Discovery
  { title: "Courses", url: "/courses", icon: GraduationCap },

  // Help
  { title: "Support", url: "/dashboard/support", icon: Headphones },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isActivePath(pathname: string, item: MenuItemType) {
  if (item.exact) return pathname === item.url;
  return pathname === item.url || pathname.startsWith(item.url + "/");
}

export default function Pages({ onLinkClick }: PagesProps) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  const navigation = isLoggedIn ? authNavigation : guestNavigation;

  return (
    <div className="flex flex-col">
      <span className="text-base font-bold uppercase text-violet-400 dark:text-indigo-200 tracking-wider px-3 mt-4 mb-2">
        Pages
      </span>

      <nav className="flex flex-col space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = isActivePath(pathname, item);
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onLinkClick}
              aria-current={isActive ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                isActive
                  ? "bg-violet-400 text-white dark:bg-violet-600 dark:text-white"
                  : "text-violet-400 hover:bg-violet-100 dark:text-gray-300 dark:hover:bg-violet-700"
              )}
            >
              <Icon
                className={cx(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-violet-400 dark:text-gray-300"
                )}
              />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}