"use client";

import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-xl bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
          <div className="mt-4 h-2 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}