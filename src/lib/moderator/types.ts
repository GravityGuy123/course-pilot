// src/lib/moderator/types.ts

export type OverviewStats = {
  users: { total: number; active: number };
  courses: { total: number; published: number; unpublished: number; deleted: number };
  enrollments: { total: number };
  payments: { total: number; by_status?: Record<string, number> };
  recent: {
    users: Array<{
      id: string;
      email: string;
      username: string;
      full_name: string;
      date_joined: string | null;
    }>;
    courses: Array<{
      id: string;
      title: string;
      created_at: string | null;
      is_deleted: boolean;
      is_published: boolean;
    }>;
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      provider: string;
      created_at: string | null;
    }>;
  };
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// ----------------------------
// MODERATION: Users
// Matches ModerationUserRowSerializer in backend
// ----------------------------
export type ModerationUserRow = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar: string | null;

  is_active: boolean;

  is_student: boolean;
  is_tutor: boolean;
  is_moderator: boolean;
  is_admin: boolean;

  date_joined: string;
  roles: string[];
};

export type FetchUsersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  role?: "student" | "tutor" | "moderator" | "admin";
  is_active?: "true" | "false";
};

export type SetUserActivePayload = {
  active: boolean;
  reason?: string;
};

// ----------------------------
// MODERATION: Applications
// Matches ModerationApplicationSerializer in backend
// ----------------------------
export type ModerationApplicant = {
  id: string;
  full_name: string;
  email: string;
  username: string;
  avatar: string | null;
  is_admin: boolean;
  is_moderator: boolean;
  is_tutor: boolean;
};

export type ModerationReviewer = {
  id: string;
  full_name: string;
  email: string;
  username: string;
};

export type ModerationApplicationRow = {
  id: string;
  role: "tutor" | "moderator" | string;
  bio: string | null;
  status: "pending" | "approved" | "rejected" | string;
  submitted_at: string;
  reviewed_at: string | null;
  applicant: ModerationApplicant | null;
  reviewer: ModerationReviewer | null;
};

export type ModerationReviewAction = "approve" | "reject";

export type FetchModerationApplicationsParams = {
  page?: number;
  page_size?: number;
  role?: "tutor" | "moderator";
};

// ----------------------------
// MODERATION: Tutors list/detail
// Matches backend list/detail payloads
// ----------------------------
export type TutorListRow = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar: string | null;

  is_active: boolean;
  tutor_publishing_frozen: boolean;

  date_joined: string | null;

  courses_total: number;
  courses_published: number;
  courses_unpublished: number;
};

export type TutorDetail = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar: string | null;

  is_active: boolean;
  is_tutor: boolean;
  tutor_publishing_frozen: boolean;

  date_joined: string | null;
  last_login: string | null;

  summary: {
    courses: { total: number; published: number; unpublished: number };
    modules: { total: number; published: number; unpublished: number };
    lessons: { total: number; published: number; unpublished: number };
  };
};

export type FetchTutorsParams = {
  page?: number;
  page_size?: number;
  search?: string;
  active?: "true" | "false";
  frozen?: "true" | "false";
};

export type FreezeTutorPayload = {
  frozen: boolean;
  reason?: string;
};

// ----------------------------
// MODERATION: Courses
// Matches ModerationCourseRowSerializer in backend
// ----------------------------
export type ModerationCourseRow = {
  id: string;
  title: string;
  created_at: string | null;

  is_published: boolean;
  is_active: boolean;
  is_deleted: boolean;

  tutor_id: string | null;
  tutor_name: string;
  category_name: string;
};

export type FetchCoursesParams = {
  page?: number;
  page_size?: number;
  search?: string;
  status?: "published" | "unpublished" | "deleted" | "active" | "inactive" | string;
};

// ----------------------------
// MODERATION: Payments
// Matches ModerationPaymentRowSerializer in backend
// ----------------------------
export type ModerationPaymentRow = {
  id: string;
  user: string;
  user_email: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_txn_id?: string;
  created_at: string;
};

export type FetchPaymentsParams = {
  page?: number;
  page_size?: number;
  status?: string;
  provider?: string;
  search?: string;
};

// ----------------------------
// MODERATION: Audit Logs
// Matches ModerationAuditLogSerializer in backend
// ----------------------------
export type ModerationAuditLogRow = {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string;
  meta: Record<string, unknown>;
  created_at: string;

  actor: string | null;
  actor_name: string;
  actor_email: string;
};

export type FetchAuditLogsParams = {
  page?: number;
  page_size?: number;
  search?: string;
  action?: string;
  target_type?: string;
  target_id?: string;
};

// ----------------------------
// MODERATION: common payload
// ----------------------------
export type ModerationReasonPayload = {
  reason?: string;
};