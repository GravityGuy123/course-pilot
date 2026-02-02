"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type IconType } from "react-icons";
import { type LucideIcon,
  Home,
  GraduationCap,
  LayoutDashboard,
  Inbox,
  Users,
  Info,
  Mail,
} from "lucide-react";
import { FiBookOpen, FiCheckSquare } from "react-icons/fi";
import { useAuth } from "@/context/auth-context";

type MenuItemType = {
  title: string;
  url: string;
  icon: LucideIcon | IconType;
};

interface PagesProps {
  onLinkClick?: () => void;
}

const guestNavigation: MenuItemType[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Courses", url: "/courses", icon: GraduationCap },
  { title: "About", url: "/about", icon: Info },
  { title: "Contact", url: "/contact", icon: Mail },
];

const authNavigation: MenuItemType[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inbox", url: "/dashboard/inbox", icon: Inbox },
  { title: "Courses", url: "/courses", icon: GraduationCap },
  { title: "Lessons", url: "/lessons", icon: FiBookOpen },
  { title: "Tasks", url: "/tasks", icon: FiCheckSquare },
  { title: "Groups", url: "/groups", icon: Users },
];

export default function Pages({ onLinkClick }: PagesProps) {
  const pathname = usePathname();

  // ✅ Use real auth state
  const { isLoggedIn } = useAuth();

  const navigation = isLoggedIn ? authNavigation : guestNavigation;

  return (
    <div className="flex flex-col">
      <span className="text-base font-bold uppercase text-violet-400 dark:text-indigo-200 tracking-wider px-3 mt-4 mb-2">
        Pages
      </span>

      <nav className="flex flex-col space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
          return (
            <Link
              key={item.title}
              href={item.url}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-violet-400 text-white dark:bg-violet-600 dark:text-white"
                  : "text-violet-400 hover:bg-violet-100 dark:text-gray-300 dark:hover:bg-violet-700"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive ? "text-white" : "text-violet-400 dark:text-gray-300"
                }`}
              />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}