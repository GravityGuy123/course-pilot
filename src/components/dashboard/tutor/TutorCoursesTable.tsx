"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ErrorToast, SuccessToast } from "@/lib/toast";
import { doDelete, doPublish, doRestore, doUnpublish } from "./actions/course-actions";
import { TutorCourse } from "@/lib/tutor-courses";

type TabKey = "active" | "deleted";

type ListUpdater<T> = T[] | ((prev: T[]) => T[]);

type Props = {
  apiBaseUrl: string;
  tab: TabKey;
  courses: TutorCourse[];
  onActiveChanged: (next: ListUpdater<TutorCourse>) => void;
  onDeletedChanged: (next: ListUpdater<TutorCourse>) => void;
};

function formatPrice(c: TutorCourse) {
  if (c.pricing_type === "FREE") return "Free";
  const currency = c.currency || "NGN";
  const amount = Number.isFinite(c.price) ? c.price : 0;
  return `${currency} ${amount.toLocaleString()}`;
}

export function TutorCoursesTable({
  apiBaseUrl,
  tab,
  courses,
  onActiveChanged,
  onDeletedChanged,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  async function handlePublish(course: TutorCourse) {
    setBusyId(course.id);
    const res = course.is_published
      ? await doUnpublish(apiBaseUrl, course)
      : await doPublish(apiBaseUrl, course);
    setBusyId(null);

    if (!res.ok) return ErrorToast(res.message, isDark);

    const next = courses.map((c) =>
      c.id === course.id ? { ...c, is_published: !course.is_published } : c
    );

    onActiveChanged(next);
    SuccessToast(res.message, isDark);
  }

  async function handleDelete(course: TutorCourse) {
    setBusyId(course.id);
    const res = await doDelete(apiBaseUrl, course);
    setBusyId(null);

    if (!res.ok) return ErrorToast(res.message, isDark);

    const remaining = courses.filter((c) => c.id !== course.id);
    onActiveChanged(remaining);

    // Optimistic move to deleted tab list
    onDeletedChanged((prev: TutorCourse[]) => [
      { ...course, is_published: false },
      ...prev,
    ]);

    SuccessToast(res.message, isDark);
  }

  async function handleRestore(course: TutorCourse) {
    setBusyId(course.id);
    const res = await doRestore(apiBaseUrl, course);
    setBusyId(null);

    if (!res.ok) return ErrorToast(res.message, isDark);

    const remainingDeleted = courses.filter((c) => c.id !== course.id);
    onDeletedChanged(remainingDeleted);

    // restored courses are forced to unpublished by backend (safer)
    onActiveChanged((prev: TutorCourse[]) => [
      { ...course, is_published: false },
      ...prev,
    ]);

    SuccessToast(res.message, isDark);
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800">
      <div className="w-full overflow-x-auto">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-violet-600 dark:bg-indigo-500 text-white">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Pricing</th>
              <th className="px-4 py-3 font-medium">Students</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((c) => {
              const isBusy = busyId === c.id;

              return (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/tutor/courses/${c.id}`}
                        className="line-clamp-1 font-medium hover:underline"
                      >
                        {c.title}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {c.level} • {c.duration || "Duration not set"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3">{c.category || "—"}</td>

                  <td className="px-4 py-3">
                    <span className="font-medium">{formatPrice(c)}</span>
                  </td>

                  <td className="px-4 py-3">{c.student_count ?? 0}</td>

                  <td className="px-4 py-3">
                    {tab === "deleted" ? (
                      <Badge variant="destructive">Deleted</Badge>
                    ) : c.is_published ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        {tab === "active" ? (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/tutor/courses/${c.id}`}>
                                Open
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/tutor/courses/${c.id}/edit`}>
                                Edit
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => void handlePublish(c)}
                              disabled={isBusy}
                            >
                              {c.is_published ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => void handleDelete(c)}
                              disabled={isBusy}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => void handleRestore(c)}
                            disabled={isBusy}
                          >
                            Restore
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}