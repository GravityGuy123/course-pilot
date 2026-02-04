"use client";

import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Variant = "loading" | "empty" | "error";

export function DashboardStateBlock({
  variant,
  title,
  description,
}: {
  variant: Variant;
  title: string;
  description?: string;
}) {
  const icon =
    variant === "loading" ? (
      <Loader2 className="h-5 w-5 animate-spin" />
    ) : variant === "error" ? (
      <AlertTriangle className="h-5 w-5" />
    ) : (
      <Inbox className="h-5 w-5" />
    );

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <p className="text-base font-semibold">{title}</p>
        {description ? (
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}