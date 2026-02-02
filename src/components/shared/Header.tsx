"use client";

import React from "react";
import { ModeToggle } from "@/components/others/ModeToggle";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import UserAvatar from "@/components/shared/UserAvatar";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { isLoggedIn, user } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 shadow rounded-xl mb-6 gap-4 sm:gap-0 w-full max-w-full overflow-x-auto">
      {/* Left: Hamburger + Search */}
      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4 min-w-0">
        <button
          className="sm:hidden text-violet-600 dark:text-indigo-300 hover:text-violet-700 dark:hover:text-indigo-400 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <input
          type="text"
          placeholder="Search your course..."
          className="flex-1 min-w-0 sm:w-64 md:w-1/3 lg:w-96 xl:w-[500px] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 min-w-0">
        <ModeToggle />

        {isLoggedIn && user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/profile/settings"
              aria-label="Go to settings"
              className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800">
              <UserAvatar
                user={user}
                size={48}
                className="rounded-full shrink-0 w-12 h-12 cursor-pointer transition-all duration-200 ease-out group-hover:scale-[1.05] group-hover:ring-2 group-hover:ring-violet-400/60 dark:group-hover:ring-indigo-300/60" />
            </Link>
            <span className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
              {user.username}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-indigo-300 border border-violet-600 dark:border-indigo-400 rounded-lg transition-colors duration-300 hover:bg-violet-50 dark:hover:bg-indigo-900/40"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all duration-300" >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}