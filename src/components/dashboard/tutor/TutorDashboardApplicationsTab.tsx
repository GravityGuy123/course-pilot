"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { DataTable, type Column } from "../shared/DataTable";
import { Application } from "@/components/dashboard/tutor/mockData";
import { cn } from "@/lib/utils";

const statusAccent = {
  approved: "border-l-green-500",
  pending: "border-l-yellow-500",
  rejected: "border-l-red-500",
};

const avatarGradient = {
  approved: "bg-gradient-to-br from-green-500 to-emerald-600",
  pending: "bg-gradient-to-br from-yellow-500 to-orange-500",
  rejected: "bg-gradient-to-br from-red-500 to-rose-600",
};

export function TutorDashboardApplicationsTab({
  applications,
}: {
  applications: Application[];
}) {
  const applicationColumns: Column<Application>[] = [
    {
      key: "name",
      label: "Applicant",
      sortable: true,
      render: (item) => (
        <div
          className={cn(
            "flex items-center gap-3 pl-3 border-l-4",
            statusAccent[item.status]
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className={cn(
                "text-xs font-semibold text-white",
                avatarGradient[item.status]
              )}
            >
              {item.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },

    {
      key: "expertise",
      label: "Expertise",
      sortable: true,
      render: (item) => (
        <Badge
          variant="secondary"
          className="rounded-md px-2 py-0.5 text-xs font-medium"
        >
          {item.expertise}
        </Badge>
      ),
    },

    {
      key: "experience",
      label: "Experience",
      sortable: true,
      render: (item) => (
        <div className="text-sm font-medium whitespace-nowrap">
          {item.experience}
          <span className="ml-1 text-xs text-muted-foreground">experience</span>
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge
          variant={
            item.status === "approved"
              ? "default"
              : item.status === "pending"
              ? "secondary"
              : "destructive"
          }
          className="capitalize"
        >
          {item.status}
        </Badge>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (item) =>
        item.status === "pending" ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-600/10"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle>Tutor Applications</CardTitle>
      </CardHeader>

      <CardContent>
        <DataTable<Application>
          data={applications}
          columns={applicationColumns}
          searchKey="name"
          searchPlaceholder="Search applications..."
        />
      </CardContent>
    </Card>
  );
}
