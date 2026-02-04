"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getTutorCourses, getTutorDeletedCourses } from "@/lib/api/tutor-courses";
import { TutorCourse } from "@/lib/tutor-courses";
import { TutorCoursesToolbar } from "./TutorCoursesToolbar";
import { DashboardStateBlock } from "./state/DashboardStateBlock";
import { TutorCoursesTable } from "./TutorCoursesTable";
import { TutorCourseCards } from "./TutorCourseCards";

type ListUpdater<T> = T[] | ((prev: T[]) => T[]);

type Props = {
  activeCourses: TutorCourse[];
  deletedCourses: TutorCourse[];
  onActiveCoursesChange: (next: TutorCourse[]) => void;
  onDeletedCoursesChange: (next: TutorCourse[]) => void;
};

type TabKey = "active" | "deleted";
type SortKey = "newest" | "oldest" | "students";

function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;

  // NOTE: this keeps your current behavior; if you want to remove regex later, say so.
  return (env && env.trim().length > 0 ? env.trim() : "http://localhost:8000").replace(/\/+$/, "");
}

function applyQuery(courses: TutorCourse[], q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return courses;

  return courses.filter((c) => {
    const title = (c.title || "").toLowerCase();
    const category = (c.category || "").toLowerCase();
    return title.includes(query) || category.includes(query);
  });
}

function applyFilters(
  courses: TutorCourse[],
  opts: {
    published: "all" | "published" | "draft";
    pricing: "all" | "FREE" | "PAID";
    sort: SortKey;
  }
) {
  let out = courses;

  if (opts.published === "published") out = out.filter((c) => c.is_published);
  if (opts.published === "draft") out = out.filter((c) => !c.is_published);

  if (opts.pricing !== "all") out = out.filter((c) => c.pricing_type === opts.pricing);

  if (opts.sort === "newest") {
    out = [...out].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  } else if (opts.sort === "oldest") {
    out = [...out].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  } else if (opts.sort === "students") {
    out = [...out].sort((a, b) => (b.student_count || 0) - (a.student_count || 0));
  }

  return out;
}

function resolveUpdater<T>(current: T[], next: ListUpdater<T>): T[] {
  return typeof next === "function" ? next(current) : next;
}

export function TutorCoursesPanel({
  activeCourses,
  deletedCourses,
  onActiveCoursesChange,
  onDeletedCoursesChange,
}: Props) {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const [tab, setTab] = useState<TabKey>("active");
  const [loading, setLoading] = useState(true);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [published, setPublished] = useState<"all" | "published" | "draft">("all");
  const [pricing, setPricing] = useState<"all" | "FREE" | "PAID">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const refreshActive = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ac = new AbortController();
    try {
      const data = await getTutorCourses(apiBaseUrl, ac.signal);
      onActiveCoursesChange(data);
    } catch (e) {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Failed to load your courses.";
      setError(msg);
    } finally {
      setLoading(false);
    }

    return () => ac.abort();
  }, [apiBaseUrl, onActiveCoursesChange]);

  const refreshDeleted = useCallback(async () => {
    setLoadingDeleted(true);
    setError(null);

    const ac = new AbortController();
    try {
      const data = await getTutorDeletedCourses(apiBaseUrl, ac.signal);
      onDeletedCoursesChange(data);
    } catch (e) {
      const msg =
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Failed to load deleted courses.";
      setError(msg);
    } finally {
      setLoadingDeleted(false);
    }

    return () => ac.abort();
  }, [apiBaseUrl, onDeletedCoursesChange]);

  useEffect(() => {
    void refreshActive();
  }, [refreshActive]);

  useEffect(() => {
    if (tab !== "deleted") return;
    if (deletedCourses.length > 0) return;
    void refreshDeleted();
  }, [tab, deletedCourses.length, refreshDeleted]);

  const sourceCourses = tab === "active" ? activeCourses : deletedCourses;

  const visibleCourses = useMemo(() => {
    const searched = applyQuery(sourceCourses, q);
    return applyFilters(searched, { published, pricing, sort });
  }, [sourceCourses, q, published, pricing, sort]);

  const isTabLoading = tab === "active" ? loading : loadingDeleted;

  const handleActiveChanged = useCallback(
    (next: ListUpdater<TutorCourse>) => {
      const resolved = resolveUpdater(activeCourses, next);
      onActiveCoursesChange(resolved);
    },
    [activeCourses, onActiveCoursesChange]
  );

  const handleDeletedChanged = useCallback(
    (next: ListUpdater<TutorCourse>) => {
      const resolved = resolveUpdater(deletedCourses, next);
      onDeletedCoursesChange(resolved);
    },
    [deletedCourses, onDeletedCoursesChange]
  );

  return (
    <div className="w-full">
      <Tabs value={tab} onValueChange={(v: string) => setTab(v as TabKey)} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger className="flex-1 sm:flex-none" value="active">
              Active
            </TabsTrigger>
            <TabsTrigger className="flex-1 sm:flex-none" value="deleted">
              Deleted
            </TabsTrigger>
          </TabsList>

          <TutorCoursesToolbar
            q={q}
            onQChange={setQ}
            published={published}
            onPublishedChange={setPublished}
            pricing={pricing}
            onPricingChange={setPricing}
            sort={sort}
            onSortChange={setSort}
            onRefresh={() => {
              if (tab === "active") void refreshActive();
              else void refreshDeleted();
            }}
            refreshing={isTabLoading}
          />
        </div>

        <TabsContent value="active" className="mt-3">
          <PanelBody
            apiBaseUrl={apiBaseUrl}
            tab="active"
            loading={loading}
            error={error}
            courses={visibleCourses}
            onActiveChanged={handleActiveChanged}
            onDeletedChanged={handleDeletedChanged}
          />
        </TabsContent>

        <TabsContent value="deleted" className="mt-3">
          <PanelBody
            apiBaseUrl={apiBaseUrl}
            tab="deleted"
            loading={loadingDeleted}
            error={error}
            courses={visibleCourses}
            onActiveChanged={handleActiveChanged}
            onDeletedChanged={handleDeletedChanged}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PanelBody({
  apiBaseUrl,
  tab,
  loading,
  error,
  courses,
  onActiveChanged,
  onDeletedChanged,
}: {
  apiBaseUrl: string;
  tab: TabKey;
  loading: boolean;
  error: string | null;
  courses: TutorCourse[];
  onActiveChanged: (next: ListUpdater<TutorCourse>) => void;
  onDeletedChanged: (next: ListUpdater<TutorCourse>) => void;
}) {
  if (loading) {
    return <DashboardStateBlock variant="loading" title="Loading courses..." />;
  }

  if (error) {
    return (
      <DashboardStateBlock
        variant="error"
        title="Something went wrong"
        description={error}
      />
    );
  }

  if (courses.length === 0) {
    return (
      <DashboardStateBlock
        variant="empty"
        title={tab === "active" ? "No courses yet" : "No deleted courses"}
        description={
          tab === "active"
            ? "Create your first course to start teaching."
            : "Deleted courses will appear here until the restore window expires."
        }
      />
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <TutorCoursesTable
          apiBaseUrl={apiBaseUrl}
          tab={tab}
          courses={courses}
          onActiveChanged={onActiveChanged}
          onDeletedChanged={onDeletedChanged}
        />
      </div>

      <div className="lg:hidden">
        <TutorCourseCards
          apiBaseUrl={apiBaseUrl}
          tab={tab}
          courses={courses}
          onActiveChanged={onActiveChanged}
          onDeletedChanged={onDeletedChanged}
        />
      </div>
    </>
  );
}