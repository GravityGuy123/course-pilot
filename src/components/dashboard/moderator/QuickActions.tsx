import Link from "next/link";

export default function QuickActions() {
  const items = [
    { label: "Manage Users", href: "/dashboard/moderator/users" },
    { label: "Moderate Courses", href: "/dashboard/moderator/courses" },
    { label: "Review Applications", href: "/dashboard/moderator/applications" },
    { label: "View Payments", href: "/dashboard/moderator/payments" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="rounded-xl border p-4 hover:bg-muted transition"
        >
          <p className="font-medium">{i.label}</p>
          <p className="mt-1 text-sm opacity-70">Open</p>
        </Link>
      ))}
    </div>
  );
}