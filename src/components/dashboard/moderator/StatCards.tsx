import type { OverviewStats } from "@/lib/moderator/types";

export default function StatCards({ stats }: { stats: OverviewStats }) {
  const cards = [
    { label: "Total Users", value: stats.users.total },
    { label: "Active Users", value: stats.users.active },
    { label: "Total Courses", value: stats.courses.total },
    { label: "Published Courses", value: stats.courses.published },
    { label: "Unpublished Courses", value: stats.courses.unpublished },
    { label: "Deleted Courses", value: stats.courses.deleted },
    { label: "Total Enrollments", value: stats.enrollments.total },
    { label: "Total Payments", value: stats.payments.total },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4 bg-white dark:bg-gray-800 shadow-sm">
          <p className="text-sm opacity-70">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold">{c.value}</p>
        </div>
      ))}
    </div>
  );
}