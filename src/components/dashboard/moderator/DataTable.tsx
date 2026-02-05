import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-white dark:bg-gray-800">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`text-left font-medium px-4 py-3 ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-top ${c.className ?? ""}`}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}