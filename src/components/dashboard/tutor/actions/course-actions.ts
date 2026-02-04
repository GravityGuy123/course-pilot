import { deleteCourse, publishCourse, restoreCourse, unpublishCourse } from "@/lib/api/tutor-courses";
import { TutorCourse } from "@/lib/tutor-courses";

export type CourseActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function errorMessage(e: unknown, fallback: string): string {
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return fallback;
}

export async function doPublish(apiBaseUrl: string, course: TutorCourse): Promise<CourseActionResult> {
  try {
    await publishCourse(apiBaseUrl, course.id);
    return { ok: true, message: "Course published." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Failed to publish course.") };
  }
}

export async function doUnpublish(apiBaseUrl: string, course: TutorCourse): Promise<CourseActionResult> {
  try {
    await unpublishCourse(apiBaseUrl, course.id);
    return { ok: true, message: "Course unpublished." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Failed to unpublish course.") };
  }
}

export async function doDelete(apiBaseUrl: string, course: TutorCourse): Promise<CourseActionResult> {
  try {
    await deleteCourse(apiBaseUrl, course.id);
    return { ok: true, message: "Course deleted." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Failed to delete course.") };
  }
}

export async function doRestore(apiBaseUrl: string, course: TutorCourse): Promise<CourseActionResult> {
  try {
    await restoreCourse(apiBaseUrl, course.id);
    return { ok: true, message: "Course restored (as draft)." };
  } catch (e) {
    return { ok: false, message: errorMessage(e, "Failed to restore course.") };
  }
}