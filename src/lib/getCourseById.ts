import { ApiResponse, CoursePageDetails } from "@/lib/types";
import { api, bootstrapCsrf } from "@/lib/axios.config";
import type { AxiosError } from "axios";

export async function getCourseById(id: string): Promise<ApiResponse<CoursePageDetails>> {
  try {
    await bootstrapCsrf();
    const res = await api.get<CoursePageDetails>(`/courses/${id}/`, {
      headers: { "Cache-Control": "no-store" },
    });

    return { data: res.data, error: "" };
  } catch (error: unknown) {
    const err = error as AxiosError | null;
    const status = err?.response?.status;

    if (status === 404) return { data: undefined, error: "Course does not exist." };
    if (status === 403) return { data: undefined, error: "You do not have permission." };

    return { data: undefined, error: "Failed to fetch course." };
  }
}
