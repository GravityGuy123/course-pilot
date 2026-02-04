import { apiRequest } from "@/lib/api/http";
import { TutorCourse } from "../tutor-courses";

export function getTutorCourses(apiBaseUrl: string, signal?: AbortSignal) {
  // /courses/tutor/ :contentReference[oaicite:7]{index=7}
  return apiRequest<TutorCourse[]>({
    method: "GET",
    path: "/api/courses/tutor/",
    apiBaseUrl,
    signal,
    requiresCsrf: false,
  });
}

export function getTutorDeletedCourses(apiBaseUrl: string, signal?: AbortSignal) {
  // /courses/tutor/deleted/ :contentReference[oaicite:8]{index=8}
  return apiRequest<TutorCourse[]>({
    method: "GET",
    path: "/api/courses/tutor/deleted/",
    apiBaseUrl,
    signal,
    requiresCsrf: false,
  });
}

export function publishCourse(apiBaseUrl: string, courseId: string) {
  // /courses/tutor/<uuid:course_id>/publish/ :contentReference[oaicite:9]{index=9}
  return apiRequest<{ detail?: string }>({
    method: "POST",
    path: `/api/courses/tutor/${courseId}/publish/`,
    apiBaseUrl,
    requiresCsrf: true,
  });
}

export function unpublishCourse(apiBaseUrl: string, courseId: string) {
  // /courses/tutor/<uuid:course_id>/unpublish/ :contentReference[oaicite:10]{index=10}
  return apiRequest<{ detail?: string }>({
    method: "POST",
    path: `/api/courses/tutor/${courseId}/unpublish/`,
    apiBaseUrl,
    requiresCsrf: true,
  });
}

export function deleteCourse(apiBaseUrl: string, courseId: string) {
  // /courses/tutor/<uuid:id>/delete/ :contentReference[oaicite:11]{index=11}
  return apiRequest<{ detail?: string }>({
    method: "DELETE",
    path: `/api/courses/tutor/${courseId}/delete/`,
    apiBaseUrl,
    requiresCsrf: true,
  });
}

export function restoreCourse(apiBaseUrl: string, courseId: string) {
  // /courses/tutor/<uuid:course_id>/restore/ :contentReference[oaicite:12]{index=12}
  return apiRequest<{ detail?: string }>({
    method: "PATCH",
    path: `/api/courses/tutor/${courseId}/restore/`,
    apiBaseUrl,
    requiresCsrf: true,
  });
}