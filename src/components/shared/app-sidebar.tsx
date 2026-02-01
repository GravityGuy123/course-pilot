"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Account from "./Account";
import LogoContent from "./LogoContent";
import Pages from "./Pages";
import DashboardPages from "./DashboardPages";
import ConditionalFriendsCard from "./ConditionalFriendsCard";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function AppSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keep focus + body scroll sane when drawer is open (mobile UX best-practice)
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const openMenu = useCallback(() => setIsMobileMenuOpen(true), []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      openButtonRef.current?.focus();
    };
  }, [isMobileMenuOpen, closeMenu]);

  return (
    <>
      {/* 🌐 Mobile hamburger (LEFT SIMPLE ON PURPOSE) */}
      <div className="md:hidden p-4 relative z-50">
        <button
          ref={openButtonRef}
          type="button"
          onClick={openMenu}
          className="p-2 rounded text-violet-500 dark:text-indigo-300 hover:bg-violet-100 dark:hover:bg-violet-700 transition"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* 🖥 Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar className="bg-gray-50 dark:bg-gray-800">
          <SidebarContent className="dark:bg-gray-800 overflow-y-auto">
            <LogoContent />
            <Pages />
            <DashboardPages />
            <ConditionalFriendsCard />
            <Account />
          </SidebarContent>
        </Sidebar>
      </div>

      {/* 📱 Mobile drawer */}
      <div
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        className={[
          "fixed inset-y-0 left-0 z-70 md:hidden",
          "w-[80vw] max-w-88 sm:w-[60vw] sm:max-w-[24rem] md:w-1/2",
          "bg-gray-50 dark:bg-gray-800 shadow-xl",
          "transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* ❌ Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMenu}
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-md p-2 text-violet-700 hover:bg-violet-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-indigo-300 dark:hover:bg-violet-700/30 dark:focus-visible:ring-offset-gray-900 transition"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="flex min-h-full flex-col overflow-y-auto px-5 pb-6 pt-16 sm:px-6">
          <div className="space-y-6">
            <LogoContent />
            <Pages onLinkClick={closeMenu} />
            <DashboardPages />
            <div className="space-y-4">
              <ConditionalFriendsCard />
              <Account />
            </div>
          </div>
        </div>
      </div>

      {/* 🌑 Overlay */}
      <div
        className={[
          "fixed inset-0 z-60 md:hidden bg-black/40 transition-opacity duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
}