export type OverviewStats = {
  users: { total: number; active: number };
  courses: { total: number; published: number; unpublished: number; deleted: number };
  enrollments: { total: number };
  payments: { total: number; by_status?: Record<string, number> };
  recent: {
    users: Array<{ id: string; email: string; username: string; full_name: string; date_joined: string }>;
    courses: Array<{ id: string; title: string; created_at: string; is_deleted: boolean; is_published: boolean }>;
    payments: Array<{ id: string; amount: number; currency: string; status: string; provider: string; created_at: string }>;
  };
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};


export type AdminCourseRow = {
  id: string;
  title: string;
  level: string;
  price: number;
  duration: string;
  is_published: boolean;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  tutor_name: string;
  category_name: string;
};

export type AdminPaymentRow = {
  id: string;
  user: string;
  user_email: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_txn_id: string;
  metadata: unknown;
  created_at: string;
};

export type AdminApplicationRow = {
  id: string;
  role: string;
  bio: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  applicant: string;
  applicant_email: string;
  applicant_name: string;
  reviewer: string | null;
  reviewer_email: string | null;
};

export type ReviewAction = "approve" | "reject";


export type AdminUserRow = {
  id: string;
  email: string;
  username: string;
  full_name: string;

  // ✅ include avatar for moderator users page
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
  active?: "true" | "false";
};