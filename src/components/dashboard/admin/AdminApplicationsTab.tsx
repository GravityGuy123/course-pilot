"use client";

import React, { useEffect, useState } from "react";
import AdminStatusBadge from "./AdminStatusBadge";
import { FileText, CheckCircle, XCircle, Download, Search } from "lucide-react";
import { api, bootstrapCsrf } from "@/lib/axios.config";
import UserAvatar from "@/components/shared/UserAvatar";

interface UserInfo {
  id: string;
  full_name: string;
  email: string;
  username: string;
  avatar?: string | null;
}

interface Application {
  id: string;
  applicant: UserInfo;
  role: string;
  status: "pending" | "approved" | "rejected";
  bio?: string;
  submitted_at: string;
  reviewed_at?: string;
  approved_at?: string;
  reviewer?: UserInfo | null;
}

export default function AdminApplicationsTab() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    let alive = true;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        await bootstrapCsrf(); // safe for POST later
        const response = await api.get<Application[]>("/admin/applications/");
        if (alive) setApps(response.data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      alive = false;
    };
  }, []);

  const handleApplicationAction = async (
    id: string,
    action: "approve" | "reject"
  ) => {
    try {
      await bootstrapCsrf();
      await api.post(`/admin/applications/${id}/review/`, { action });

      setApps((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: action === "approve" ? "approved" : "rejected",
                approved_at:
                  action === "approve" ? new Date().toISOString() : undefined,
              }
            : app
        )
      );
    } catch (err) {
      console.error("Failed to update application:", err);
    }
  };

  const filteredApps = apps.filter((app) => {
    const searchTarget = app.applicant.email + app.applicant.full_name + app.role;
    return (
      (searchTerm === "" ||
        searchTarget.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || app.status === filterStatus)
    );
  });

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Loading applications...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Instructor Applications
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          aria-label="Filter by status"
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as "all" | "pending" | "approved" | "rejected"
            )
          }
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col lg:flex-row lg:items-start gap-6"
            >
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-3 capitalize">
                  {app.role} Application <AdminStatusBadge status={app.status} />
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserAvatar user={app.applicant} size={48} />
                  <span>
                    {app.applicant.full_name} ({app.applicant.email})
                  </span>
                </div>

                {app.bio && (
                  <p className="text-gray-700 dark:text-gray-300">{app.bio}</p>
                )}
              </div>

              {app.status === "pending" && (
                <div className="flex sm:flex-row lg:flex-col gap-3 lg:w-48 mt-4 lg:mt-0">
                  <button
                    onClick={() => handleApplicationAction(app.id, "approve")}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-green-500"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleApplicationAction(app.id, "reject")}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl focus:ring-2 focus:ring-red-500"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}