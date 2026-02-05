import type { OverviewStats } from "@/lib/moderator/types";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function RecentActivity({ recent }: { recent: OverviewStats["recent"] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Recent Users">
        {recent.users.map((u) => (
          <Row
            key={u.id}
            primary={u.full_name || u.username}
            secondary={`${u.email} · ${formatDate(u.date_joined)}`}
          />
        ))}
      </Card>

      <Card title="Recent Courses">
        {recent.courses.map((c) => (
          <Row
            key={c.id}
            primary={c.title}
            secondary={`${c.is_published ? "Published" : "Unpublished"} · ${formatDate(c.created_at)}`}
          />
        ))}
      </Card>

      <Card title="Recent Payments">
        {recent.payments.map((p) => (
          <Row
            key={p.id}
            primary={`${p.amount} ${p.currency} · ${p.status}`}
            secondary={`${p.provider} · ${formatDate(p.created_at)}`}
          />
        ))}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <p className="text-sm font-medium">{primary}</p>
      <p className="text-xs opacity-70">{secondary}</p>
    </div>
  );
}