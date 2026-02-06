// src/lib/moderator/api.ts
import { api } from "@/lib/axios.config";
import { buildQuery } from "./query";
import type {
  PaginatedResponse,
  OverviewStats,

  ModerationUserRow,
  FetchUsersParams,
  SetUserActivePayload,

  ModerationApplicationRow,
  FetchModerationApplicationsParams,
  ModerationReviewAction,
  ModerationReasonPayload,

  TutorListRow,
  TutorDetail,
  FetchTutorsParams,
  FreezeTutorPayload,

  ModerationCourseRow,
  FetchCoursesParams,

  ModerationPaymentRow,
  FetchPaymentsParams,

  ModerationAuditLogRow,
  FetchAuditLogsParams,
} from "./types";

// ------------------------------------
// Overview
// ------------------------------------
export async function fetchOverview(): Promise<OverviewStats> {
  const res = await api.get<OverviewStats>(`/users/moderation/overview/`);
  return res.data;
}

// ------------------------------------
// Users
// ------------------------------------
export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<PaginatedResponse<ModerationUserRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<ModerationUserRow>>(`/users/moderation/users/${qs}`);
  return res.data;
}

export async function setUserActive(
  userId: string,
  payload: SetUserActivePayload
): Promise<{ detail: string; active: boolean }> {
  const res = await api.post<{ detail: string; active: boolean }>(
    `/users/moderation/users/${userId}/set-active/`,
    payload
  );
  return res.data;
}

// ------------------------------------
// Applications (pending + detail + approve/reject)
// NOTE: backend endpoint is pending-only right now.
// ------------------------------------
export async function fetchPendingApplications(
  params: FetchModerationApplicationsParams = {}
): Promise<PaginatedResponse<ModerationApplicationRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<ModerationApplicationRow>>(
    `/users/moderation/applications/pending/${qs}`
  );
  return res.data;
}

export async function fetchApplicationDetail(applicationId: string): Promise<ModerationApplicationRow> {
  const res = await api.get<ModerationApplicationRow>(`/users/moderation/applications/${applicationId}/`);
  return res.data;
}

export async function reviewApplication(
  applicationId: string,
  action: ModerationReviewAction,
  payload: ModerationReasonPayload = {}
): Promise<{ detail: string }> {
  const endpoint =
    action === "approve"
      ? `/users/moderation/applications/${applicationId}/approve/`
      : `/users/moderation/applications/${applicationId}/reject/`;

  const res = await api.post<{ detail: string }>(endpoint, payload);
  return res.data;
}

// ------------------------------------
// Tutors
// ------------------------------------
export async function fetchTutors(
  params: FetchTutorsParams = {}
): Promise<PaginatedResponse<TutorListRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<TutorListRow>>(`/users/moderation/tutors/${qs}`);
  return res.data;
}

export async function fetchTutorDetail(tutorId: string): Promise<TutorDetail> {
  const res = await api.get<TutorDetail>(`/users/moderation/tutors/${tutorId}/`);
  return res.data;
}

export async function setTutorPublishingFreeze(
  tutorId: string,
  payload: FreezeTutorPayload
): Promise<{ detail: string; frozen: boolean }> {
  const res = await api.post<{ detail: string; frozen: boolean }>(
    `/users/moderation/tutors/${tutorId}/freeze-publishing/`,
    payload
  );
  return res.data;
}

// ------------------------------------
// Courses
// ------------------------------------
export async function fetchCourses(
  params: FetchCoursesParams = {}
): Promise<PaginatedResponse<ModerationCourseRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<ModerationCourseRow>>(`/users/moderation/courses/${qs}`);
  return res.data;
}

export async function moderationUnpublishCourse(
  courseId: string,
  payload: ModerationReasonPayload = {}
): Promise<{ detail: string }> {
  const res = await api.post<{ detail: string }>(`/users/moderation/courses/${courseId}/unpublish/`, payload);
  return res.data;
}

export async function moderationUnpublishLesson(
  lessonId: string,
  payload: ModerationReasonPayload = {}
): Promise<{ detail: string }> {
  const res = await api.post<{ detail: string }>(`/users/moderation/lessons/${lessonId}/unpublish/`, payload);
  return res.data;
}

// ------------------------------------
// Payments (read-only)
// ------------------------------------
export async function fetchPayments(
  params: FetchPaymentsParams = {}
): Promise<PaginatedResponse<ModerationPaymentRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<ModerationPaymentRow>>(`/users/moderation/payments/${qs}`);
  return res.data;
}

// ------------------------------------
// Audit logs
// ------------------------------------
export async function fetchAuditLogs(
  params: FetchAuditLogsParams = {}
): Promise<PaginatedResponse<ModerationAuditLogRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<ModerationAuditLogRow>>(`/users/moderation/audit-logs/${qs}`);
  return res.data;
}