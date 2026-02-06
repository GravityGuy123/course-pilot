// src/lib/moderator/api.ts
import { authApi } from "@/lib/axios.config";
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
  const res = await authApi.get<OverviewStats>(`/moderation/overview/`);
  return res.data;
}

// ------------------------------------
// Users
// ------------------------------------
export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<PaginatedResponse<ModerationUserRow>> {
  const qs = buildQuery(params);
  const res = await authApi.get<PaginatedResponse<ModerationUserRow>>(`/moderation/users/${qs}`);
  return res.data;
}

export async function setUserActive(
  userId: string,
  payload: SetUserActivePayload
): Promise<{ detail: string; active: boolean }> {
  const res = await authApi.post<{ detail: string; active: boolean }>(
    `/moderation/users/${userId}/set-active/`,
    payload
  );
  return res.data;
}

// ------------------------------------
// Applications (pending + detail + approve/reject)
// ------------------------------------
export async function fetchPendingApplications(
  params: FetchModerationApplicationsParams = {}
): Promise<PaginatedResponse<ModerationApplicationRow>> {
  const qs = buildQuery(params);
  const res = await authApi.get<PaginatedResponse<ModerationApplicationRow>>(
    `/moderation/applications/pending/${qs}`
  );
  return res.data;
}

export async function fetchApplicationDetail(applicationId: string): Promise<ModerationApplicationRow> {
  const res = await authApi.get<ModerationApplicationRow>(`/moderation/applications/${applicationId}/`);
  return res.data;
}

export async function reviewApplication(
  applicationId: string,
  action: ModerationReviewAction,
  payload: ModerationReasonPayload = {}
): Promise<{ detail: string }> {
  const endpoint =
    action === "approve"
      ? `/moderation/applications/${applicationId}/approve/`
      : `/moderation/applications/${applicationId}/reject/`;

  const res = await authApi.post<{ detail: string }>(endpoint, payload);
  return res.data;
}

// ------------------------------------
// Tutors
// ------------------------------------
export async function fetchTutors(
  params: FetchTutorsParams = {}
): Promise<PaginatedResponse<TutorListRow>> {
  const qs = buildQuery(params);
  const res = await authApi.get<PaginatedResponse<TutorListRow>>(`/moderation/tutors/${qs}`);
  return res.data;
}

export async function fetchTutorDetail(tutorId: string): Promise<TutorDetail> {
  const res = await authApi.get<TutorDetail>(`/moderation/tutors/${tutorId}/`);
  return res.data;
}

export async function setTutorPublishingFreeze(
  tutorId: string,
  payload: FreezeTutorPayload
): Promise<{ detail: string; frozen: boolean }> {
  const res = await authApi.post<{ detail: string; frozen: boolean }>(
    `/moderation/tutors/${tutorId}/freeze-publishing/`,
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
  const res = await authApi.get<PaginatedResponse<ModerationCourseRow>>(`/moderation/courses/${qs}`);
  return res.data;
}

export async function moderationUnpublishCourse(
  courseId: string,
  payload: ModerationReasonPayload = {}
): Promise<{ detail: string }> {
  const res = await authApi.post<{ detail: string }>(
    `/moderation/courses/${courseId}/unpublish/`,
    payload
  );
  return res.data;
}

export async function moderationUnpublishLesson(
  lessonId: string,
  payload: ModerationReasonPayload = {}
): Promise<{ detail: string }> {
  const res = await authApi.post<{ detail: string }>(
    `/moderation/lessons/${lessonId}/unpublish/`,
    payload
  );
  return res.data;
}

// ------------------------------------
// Payments (read-only)
// ------------------------------------
export async function fetchPayments(
  params: FetchPaymentsParams = {}
): Promise<PaginatedResponse<ModerationPaymentRow>> {
  const qs = buildQuery(params);
  const res = await authApi.get<PaginatedResponse<ModerationPaymentRow>>(`/moderation/payments/${qs}`);
  return res.data;
}

// ------------------------------------
// Audit logs
// ------------------------------------
export async function fetchAuditLogs(
  params: FetchAuditLogsParams = {}
): Promise<PaginatedResponse<ModerationAuditLogRow>> {
  const qs = buildQuery(params);
  const res = await authApi.get<PaginatedResponse<ModerationAuditLogRow>>(`/moderation/audit-logs/${qs}`);
  return res.data;
}