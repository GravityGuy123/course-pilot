export type UUID = string;

export type PricingType = "FREE" | "PAID";

export type FeaturedCourse = {
  id: UUID;
  title: string;
  slug: string;
  description: string;
  level: string;
  pricing_type: PricingType;
  currency: string;
  price: number;
  duration: string;
  image: string | null;
  category: string;
  tutor: { id: string; full_name: string; username: string } | null;
  student_count: number;
  is_featured: boolean;
  created_at: string;
};

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED" | string;

export type MyEnrollment = {
  id: UUID;
  status: EnrollmentStatus;

  course: {
    id: UUID;
    title: string;
    slug?: string | null;
    image?: string | null;
    level?: string | null;
    duration?: string | null;
    pricing_type?: PricingType;
    currency?: string | null;
    price?: number | null;
  };

  progress_percent?: number | null;
  completed_lessons?: number | null;
  total_lessons?: number | null;

  last_activity_at?: string | null;

  next_lesson_id?: UUID | null;
  next_lesson_title?: string | null;

  created_at?: string;
};

export type ContinueLearning = {
  enrollmentId: UUID;
  courseId: UUID;
  title: string;
  image: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  nextLessonId: UUID | null;
  nextLessonTitle: string | null;
  lastActivity: string | null;
};