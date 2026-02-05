export default function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-xl border p-6 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm opacity-70">{message}</p>
    </div>
  );
}