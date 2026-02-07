"use client";

import { useCallback, useEffect, useRef } from "react";
import Account from "./Account";
import LogoContent from "./LogoContent";
import Pages from "./Pages";
import DashboardPages from "./DashboardPages";
import ConditionalFriendsCard from "./ConditionalFriendsCard";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useMobileSidebar } from "@/context/mobile-sidebar-context";

export function AppSidebar() {
  const { isOpen, close } = useMobileSidebar();

  // Focus management for accessibility
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = useCallback(() => close(), [close]);

  useEffect(() => {
    if (!isOpen) return;

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
    };
  }, [isOpen, closeMenu]);

  return (
    <>
      {/* 🖥 Desktop sidebar (md+) */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:block md:w-[260px] md:overflow-y-auto md:border-r md:border-gray-200 md:bg-gray-50 dark:md:border-gray-800 dark:md:bg-gray-900">
        <Sidebar className="bg-transparent">
          <SidebarContent className="overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <LogoContent />
            <Pages />
            <DashboardPages />
            <ConditionalFriendsCard />
            <Account />
          </SidebarContent>
        </Sidebar>
      </div>

      {/* 📱 Mobile drawer (<md) */}
      <div
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar navigation"
        className={[
          "fixed inset-y-0 left-0 md:hidden",
          "flex flex-col h-dvh", // ✅ CRITICAL FIX
          "z-70",
          "w-[88vw] max-w-[22rem] sm:w-[70vw] sm:max-w-[26rem]",
          "bg-gray-50 dark:bg-gray-800 shadow-xl",
          "transform transition-transform duration-300 ease-in-out will-change-transform",
          isOpen
            ? "translate-x-0 pointer-events-auto"
            : "-translate-x-full pointer-events-none",
        ].join(" ")}
      >
        {/* ❌ Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMenu}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 inline-flex items-center justify-center rounded-lg p-2 text-violet-700 hover:bg-violet-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:text-indigo-300 dark:hover:bg-violet-700/30 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-gray-900 transition"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Drawer content */}
        <div
          className={[
            "flex min-h-full flex-col overflow-y-auto overscroll-contain",
            "px-4 sm:px-6",
            "pt-[max(4rem,env(safe-area-inset-top))]",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          ].join(" ")}
        >
          <div className="space-y-6">
            <LogoContent />
            <Pages onLinkClick={closeMenu} />
            <DashboardPages onLinkClick={closeMenu} />
            <div className="space-y-4">
              <ConditionalFriendsCard />
              <Account onLinkClick={closeMenu} />
            </div>
          </div>
        </div>
      </div>

      {/* 🌑 Overlay */}
      <div
        className={[
          "fixed inset-0 md:hidden bg-black/40 transition-opacity duration-300",
          "z-60",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
}