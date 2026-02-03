"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight } from "lucide-react";

export default function QuickActionsCard() {
  return (
    <div className="mt-6 rounded-2xl border bg-card p-4 sm:p-6 bg-white dark:bg-gray-800">
      <h3 className="text-base font-semibold text-foreground">Quick actions</h3>
      <p className="mt-1 text-sm text-muted-foreground">Shortcuts to help you move faster.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center justify-between gap-3 rounded-2xl border bg-background/40 px-4 py-3 transition hover:bg-background/60"
        >
          <span className="text-sm font-medium text-foreground">Profile</span>
          <ChevronRight className="h-4 w-4 text-foreground/70" />
        </Link>

        <Link
          href="/dashboard/inbox"
          className="inline-flex items-center justify-between gap-3 rounded-2xl border bg-background/40 px-4 py-3 transition hover:bg-background/60"
        >
          <span className="text-sm font-medium text-foreground">Notifications</span>
          <ChevronRight className="h-4 w-4 text-foreground/70" />
        </Link>

        <Link
          href="/dashboard/support"
          className="inline-flex items-center justify-between gap-3 rounded-2xl border bg-background/40 px-4 py-3 transition hover:bg-background/60"
        >
          <span className="text-sm font-medium text-foreground">Support</span>
          <ChevronRight className="h-4 w-4 text-foreground/70" />
        </Link>
      </div>
    </div>
  );
}