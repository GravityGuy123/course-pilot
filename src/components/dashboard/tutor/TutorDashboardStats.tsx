"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react";
import { api } from "@/lib/axios.config";

interface TutorStats {
  total_students: number;
  active_courses: number;
  total_revenue: number;
  avg_completion: number;
}

export function TutorDashboardStats() {
  const [stats, setStats] = useState<TutorStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<TutorStats>("/tutor/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch tutor stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-red-500 dark:text-red-400">Failed to load stats</p>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Students"
        value={stats.total_students.toLocaleString()}
        icon={Users}
        className="dark:bg-gray-800"
      />
      <StatsCard
        title="Active Courses"
        value={stats.active_courses.toString()}
        icon={BookOpen}
        className="dark:bg-gray-800"
      />
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.total_revenue)}
        icon={DollarSign}
        className="dark:bg-gray-800"
      />
      <StatsCard
        title="Avg. Completion"
        value={`${stats.avg_completion}%`}
        icon={TrendingUp}
        className="dark:bg-gray-800"
      />
    </div>
  );
}