"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function getCourseImageUrl(c: TutorCourse): string | null {
  const raw = (c as { image?: unknown }).image;
  if (typeof raw !== "string") return null;
  const url = raw.trim();
  return url.length > 0 ? url : null;
}

function initialsFromTitle(title: string) {
  const t = title.trim();
  if (!t) return "CP";
  const parts = t.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "C";
  const second = parts[1]?.[0] ?? "P";
  return `${first}${second}`.toUpperCase();
}

export function TutorCourseCards({
  apiBaseUrl,
  tab,
  courses,
  onActiveChanged,
  onDeletedChanged,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  async function publishToggle(course: TutorCourse) {
    setBusyId(course.id);

    const res = course.is_published ? await doUnpublish(apiBaseUrl, course) : await doPublish(apiBaseUrl, course);

    setBusyId(null);

    if (!res.ok) return ErrorToast(res.message, isDark);

    onActiveChanged(courses.map((c) => (c.id === course.id ? { ...c, is_published: !course.is_published } : c)));
    SuccessToast(res.message, isDark);
  }

  async function remove(course: TutorCourse) {
    setBusyId(course.id);
    const res = await doDelete(apiBaseUrl, course);
    setBusyId(null);

    if (!res.ok) return ErrorToast(res.message, isDark);

    onActiveChanged(courses.filter((c) => c.id !== course.id));
    onDeletedChanged((prev) => [{ ...course, is_published: false }, ...prev]);

    SuccessToast(res.message, isDark);
  }

  async function restore(course: TutorCourse) {
    setBusyId(course.id);
    const res = await doRestore(apiBaseUrl, course);
    setBusyId(null);

    if (!res.ok) return ErrorToast(res.message, isDark);

    onDeletedChanged(courses.filter((c) => c.id !== course.id));
    onActiveChanged((prev) => [{ ...course, is_published: false }, ...prev]);

    SuccessToast(res.message, isDark);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {courses.map((c) => {
        const isBusy = busyId === c.id;
        const img = getCourseImageUrl(c);

        return (
          <Card key={c.id} className="overflow-hidden bg-white dark:bg-gray-800">
            {/* Image header */}
            <Link
              href={`/dashboard/tutor/courses/${c.id}`}
              className="relative block aspect-[16/9] w-full overflow-hidden bg-muted ring-1 ring-border"
              aria-label={`Open ${c.title}`}
            >
              {img ? (
                <Image
                  src={img}
                  alt={c.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <div className="rounded-xl bg-background/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                    {initialsFromTitle(c.title)}
                  </div>
                </div>
              )}

              {/* subtle overlay for readability */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
            </Link>

            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/tutor/courses/${c.id}`}
                    className="line-clamp-1 text-base font-semibold hover:underline"
                  >
                    {c.title}
                  </Link>

                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {c.category || "Uncategorized"} • {c.level} • {c.duration || "Duration not set"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {tab === "deleted" ? (
                      <Badge variant="destructive">Deleted</Badge>
                    ) : c.is_published ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}

                    <Badge variant="outline">{formatPrice(c)}</Badge>

                    <span className="text-xs text-muted-foreground">{c.student_count ?? 0} students</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isBusy} aria-label="Course actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    {tab === "active" ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/tutor/courses/${c.id}`}>Open</Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/tutor/courses/${c.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => void publishToggle(c)} disabled={isBusy}>
                          {c.is_published ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => void remove(c)}
                          disabled={isBusy}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => void restore(c)} disabled={isBusy}>
                        Restore
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Created: {new Date(c.created_at).toLocaleDateString()}</span>
                <span>{c.slug ? `/${c.slug}` : ""}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}