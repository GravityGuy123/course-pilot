"use client";

import React from "react";
// import { clamp } from "@/components/students/utils/format";
import { clamp } from "@/lib/format";
// import { CourseModule } from "@/lib/types";

export default function ProgressBar({ value }: { value: number }) {
  const pct = clamp(Math.round(value), 0, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${pct}%` }}
        aria-label={`Progress ${pct}%`}
      />
    </div>
  );
}