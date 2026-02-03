"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 bg-white dark:bg-gray-800">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-muted p-2 bg-violet-600 dark:bg-indigo-500">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}