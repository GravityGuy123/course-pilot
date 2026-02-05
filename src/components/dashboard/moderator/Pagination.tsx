"use client";

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm opacity-70">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{totalPages}</span> ·{" "}
        <span className="font-medium">{total}</span> records
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-muted transition"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50 hover:bg-muted transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}