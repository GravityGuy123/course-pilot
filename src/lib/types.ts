import type { StaticImport } from "next/dist/shared/lib/get-img-props";
import { LucideIcon } from "lucide-react";

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_customer: boolean;
  is_vendor: boolean;
  date_joined: string;
}

export interface ShippingAddress {
  id: string;
  user?: User;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  lga: string;
  zip_code: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  brand_name: string;
  avatar: string;
  is_activated: boolean;
  total_sales_ever: number;
  created_at: string;
  updated_at: string;
  is_diamond: boolean;
}

export interface Product {
  id: string;
  vendor: Vendor;
  name: string;
  stock: number;
  description: string;
  is_on_flash_sales: boolean;
  current_price: number;
  old_price?: number;
  thumbnail: string;
  created_at: string;
  updated_at: string;
  is_in_stock: boolean;
  percentage_diffrence: number;
}

interface CartItem {
  id: string;
  user?: User;
  product: Product;
  quantity: number;
  added_at: string;
  sub_total: number;
}

export interface Cart {
  id: string;
  user: User;
  cart_items: CartItem[];
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price_per_item: number;
  sub_total: number;
}

export interface Order {
  id: string;
  user: User;
  shipping_address?: ShippingAddress;
  status: string;
  order_items: OrderItem[];
  amount: number;
  readonly order_refrence: string;
  payment_refrence: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user: User;
  order: Order;
  amount: number;
  payment_method?: string;
  payment_status: string;
  payment_refrence?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type Lesson = {
  id: string;
  title: string;
  content: string;
  video_url?: string | null;
  created_at?: string;
  updated_at?: string;
  course?: string;
  tutor?: string; // legacy field, often holds tutor name
};

export type Course = {
  id: string;
  title: string;
  description: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  lessons?: Lesson[];
  tutor?: {
    id: string;
    full_name?: string;
    email?: string;
  };
};


export type Enrollment = {
  id: string;
  course: Course;
  progress: number;
};

export type AnalyticsRow = {
  id: string;
  date: string;
  new_users: number;
  new_courses: number;
  new_enrollments: number;
};

export type Application = {
  id: string;
  role: string;
  applicant: { email: string } | string;
  bio?: string;
  status?: 'approved' | 'rejected' | 'pending';
};

export type UserRole = {
  is_student?: boolean;
  is_tutor?: boolean;
  is_moderator?: boolean;
  is_admin?: boolean;
  is_staff?: boolean;
};

export interface DashboardCourse {
  id: string;
  title: string;
  description: string;
  tutor: string;
  level: "Beginner" | "Advanced" | "Intermediate";
  duration: string;
  category_id: string | null;
  thumbnail_url: string | null;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface CourseCardProps {
  title: string;
  description?: string;
  tutor: string;
  thumbnail?: string | StaticImport | null;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  studentCount?: number;
  rating?: number;
  price?: number;
  featured?: boolean;
  onEnroll?: () => void;
  onView?: () => void;
  className?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface CourseProgressCardProps {
  title: string;
  instructor: string;
  thumbnail?: string | null;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  duration: string;
  category: string;
  onContinue?: () => void;
}

export interface RecommendedCourse {
  id: number;
  title: string;
  category: string;
  duration: string;
  rating: number;
  tutor?: {
    full_name: string;
  };
}

export interface ScheduleEvent {
  id: number;
  title: string;
  type: string;
  time: string;
  date: string;
  tutor: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  progress: number;
  enrolledDate: string;
}

export interface LessonsPageLesson {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  completed: boolean;
  rating: number;
  thumbnail: string;
  category: string;
}

export type TutorDashboardCourse = {
  id: string;
  title: string;
  status: "published" | "draft"; 
  students: number;
  completionRate: number;
  rating: number;
  revenue: number;
};

export type ToastPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface ToastOptions {
  position?: ToastPosition;
}

export interface AdminSettingsTabProps {
  settings: Record<string, string | number>;
  handleSettingChange: (key: string, value: string) => void;
}


export interface AdminApplication {
  id: string | number;
  role: string;
  status: "pending" | "approved" | "rejected";
  applicant: { email: string } | string;
  bio: string;
}

export interface AdminApplicationsTabProps {
  apps: AdminApplication[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: "all" | "pending" | "approved" | "rejected";
  setFilterStatus: (status: "all" | "pending" | "approved" | "rejected") => void;
  handleApplicationAction: (id: string | number, action: "approve" | "reject") => void;
  exportData: () => void;
}

export interface CourseDetailsPageProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  level: string;
  duration?: string;
}

export interface AllCoursesPageProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  level: string;
  duration?: string;
  student_count?: number;
  is_active?: boolean;
  tutor?: Tutor;
  category: string;
  is_published?: boolean;
  created_at?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  days_remaining?: number;
}


export interface CoursePageProps {
  params: {
    id: string;
  };
}

export interface CoursePageIdProps {
  id: string;
}

export interface Tutor {
  id: string;
  full_name: string;
  username: string;
}

export type CourseComponentLesson = {
  id: string;
  title: string;
  content: string;
  video_url?: string | null;
  created_at?: string;
  updated_at?: string;
  course?: string;
  tutor?: string;
};

export interface CoursePageDetails {
  id: string;
  title: string;
  description: string;
  level: string;
  duration?: string;
  price: number;
  image?: string;
  tutor: Tutor;
  category: string;
  category_id: string;
  student_count?: number;
  lessons: CourseComponentLesson[];
  modules: CourseModule[];
}

// export interface ApiResponse {
//   data?: CoursePageDetails;
//   error?: string;
// }

export interface ApiResponse<T = unknown> {
  data?: T;
  error: string;
}

export interface CoursePageIdProps {
  id: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  is_published: boolean;
}

export interface PublicCourse {
  id: string;
  title: string;
  description?: string;
  level: string;
  price: number;
  duration?: string;
  image?: string | null;
  student_count?: number;
  category: string;
  tutor?: {
    id: string;
    full_name: string;
    username: string;
  };
  is_deleted?: boolean;
  is_active?: boolean;
  pricing_type?: "FREE" | "PAID";
  currency?: string;
}

export interface CurrentUser {
  id: string;
  is_tutor: boolean;
}


export interface TutorInfo {
  id: string;
  full_name: string;
  username: string;
}

export interface CourseDetails {
  id: string;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  price: number;
  image?: string | null;
  student_count?: number;
  category?: string | null;
  tutor?: TutorInfo | null;
  pricing_type?: "FREE" | "PAID";
  currency?: string;
}

export type PaymentRequiredPayload = {
  detail: string;
  enrollment_id: string;
  course_id: string;
  pricing_type: "PAID";
  currency: string;
  amount_due: number;
  next_action: "INITIATE_PAYMENT";
};