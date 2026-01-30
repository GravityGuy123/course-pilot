"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, DollarSign } from "lucide-react";
import { api } from "@/lib/axios.config";

interface CourseRevenue {
  id: string;
  title: string;
  revenue: number;
}

interface EarningsSummary {
  this_month: number;
  pending_payout: number;
  all_time: number;
}

export function TutorDashboardEarningsTab() {
  const [courses, setCourses] = useState<CourseRevenue[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({
    this_month: 0,
    pending_payout: 0,
    all_time: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    value.toLocaleString("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 });

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tutor/earnings");
        setCourses(response.data.courses);
        setSummary(response.data.summary);
      } catch (err) {
        console.error(err);
        setError("Failed to load earnings data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading earnings...</p>;
  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

  // Calculate max revenue for dynamic progress scaling
  const maxRevenue = Math.max(...courses.map((c) => c.revenue), 1); // avoid division by zero

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Earnings Overview */}
      <Card className="dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {/* This Month */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4 dark:bg-gray-700/40">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.this_month)}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>

            {/* Pending Payout */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4 dark:bg-gray-700/40">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.pending_payout)}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>

            {/* All Time */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4 dark:bg-gray-700/40">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">All Time</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.all_time)}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white shadow-sm transition-all duration-300"
          >
            Request Payout
          </Button>
        </CardContent>
      </Card>

      {/* Revenue by Course */}
      <Card className="dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Revenue by Course</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-5">
            {courses.map((course) => {
              const isZeroRevenue = course.revenue === 0;
              return (
                <div key={course.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-sm font-medium truncate ${isZeroRevenue ? "text-gray-400" : ""}`}>
                      {course.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {isZeroRevenue && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white dark:text-white shadow-sm">
                          No revenue yet
                        </span>
                      )}
                      <span className={`text-sm font-semibold tabular-nums ${isZeroRevenue ? "text-gray-400" : ""}`}>
                        {formatCurrency(course.revenue)}
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={(course.revenue / maxRevenue) * 100}
                    className={`h-2 ${isZeroRevenue ? "bg-gray-500/30" : "bg-muted dark:bg-gray-700"}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}