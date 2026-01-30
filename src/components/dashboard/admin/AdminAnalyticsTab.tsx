"use client";

import { useEffect, useState } from "react";
import AdminAnalyticsChart from "./AdminAnalyticsChart";
import { api } from "@/lib/axios.config";

// -------------------------
// Define type and export
// -------------------------
export type AnalyticsRow = {
  id: string;
  date: string;
  new_users: number;
  new_courses: number;
  new_enrollments: number;
};

// -------------------------
// Component
// -------------------------
export default function AdminAnalyticsTab() {
  const [analyticsRows, setAnalyticsRows] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get<AnalyticsRow[]>("/admin/analytics/site");
        setAnalyticsRows(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Loading analytics...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Analytics
      </h2>

      {analyticsRows.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <AdminAnalyticsChart rows={analyticsRows} />
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            No analytics data available
          </p>
        </div>
      )}
    </div>
  );
}