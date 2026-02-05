import { api, authApi } from "@/lib/axios.config";
import { buildQuery } from "./query";
import type {
  OverviewStats,
  PaginatedResponse,
  AdminUserRow,
  AdminCourseRow,
  AdminPaymentRow,
  AdminApplicationRow,
  ReviewAction,
  FetchUsersParams,
} from "./types";


export async function fetchOverview(): Promise<OverviewStats> {
  const res = await api.get<OverviewStats>("/admin/overview-stats/");
  return res.data;
}

export async function fetchUsers(params: {
  search?: string;
  role?: string;
  is_active?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminUserRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<AdminUserRow>>(`/admin/users/${qs}`);
  return res.data;
}

export async function fetchCourses(params: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminCourseRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<AdminCourseRow>>(`/admin/courses/${qs}`);
  return res.data;
}

export async function fetchPayments(params: {
  status?: string;
  provider?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminPaymentRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<AdminPaymentRow>>(`/admin/payments/${qs}`);
  return res.data;
}

export async function fetchApplications(params: {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AdminApplicationRow>> {
  const qs = buildQuery(params);
  const res = await api.get<PaginatedResponse<AdminApplicationRow>>(`/admin/applications/${qs}`);
  return res.data;
}

export async function reviewApplication(applicationId: string, action: ReviewAction): Promise<{ detail: string; status: string }> {
  const res = await api.post<{ detail: string; status: string }>(`/admin/applications/${applicationId}/review/`, {
    action,
  });
  return res.data;
}