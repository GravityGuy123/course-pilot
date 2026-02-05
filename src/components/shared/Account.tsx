"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type LucideIcon, Settings, LogOut, User, CreditCard } from "lucide-react";
import { useTheme } from "next-themes";

import { useAuth } from "@/context/auth-context";
import { ErrorToast, SuccessToast } from "@/lib/toast";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type MenuItemType = {
  title: string;
  url?: string; // optional for Logout
  icon: LucideIcon;
};

const userItems: MenuItemType[] = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Billing",
    url: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/dashboard/profile/settings",
    icon: Settings,
  },
  {
    title: "Logout",
    icon: LogOut,
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Account() {
  const { isLoggedIn, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pathname = usePathname();
  const router = useRouter();

  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    try {
      await logout();
      SuccessToast("You have logged out successfully", isDark, {
        position: "top-right",
      });
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
      ErrorToast("Logout failed. Please try again.", isDark, {
        position: "top-center",
      });
    }
  };

  return (
    <SidebarGroup className="mt-1">
      <SidebarGroupLabel className="text-base font-bold uppercase text-violet-400 dark:text-indigo-200 tracking-wider">
        Account
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {userItems.map((item) => {
            const isLogout = item.title === "Logout";

            /**
             * Active state rules:
             * - Profile → EXACT match only
             * - Other routes → exact OR sub-routes
             */
            const isActive = item.url
              ? item.url === "/dashboard/profile"
                ? pathname === item.url
                : pathname === item.url || pathname.startsWith(item.url + "/")
              : false;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  {isLogout ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={cx(
                        "w-full text-left flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                      )}
                    >
                      <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span className="font-medium text-red-600 dark:text-red-500">
                        {item.title}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={item.url!}
                      className={cx(
                        "flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                        isActive
                          ? "bg-violet-400 text-white dark:bg-violet-600 dark:text-white"
                          : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <item.icon
                        className={cx(
                          "w-4 h-4",
                          isActive
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-300"
                        )}
                      />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}