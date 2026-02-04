export type PricingType = "FREE" | "PAID";

export type TutorCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;

  pricing_type: PricingType;
  currency: string;
  price: number;

  duration: string;
  image: string | null;
  category: string | null;

  student_count: number;

  is_published: boolean;
  is_active: boolean;
  is_featured: boolean;

  created_at: string;
  updated_at?: string;

  // Soft-delete fields may exist depending on serializer; keep optional.
  is_deleted?: boolean;
  deleted_at?: string | null;
};

export type TutorDashboardStats = {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
};