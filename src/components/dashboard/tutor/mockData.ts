import { TutorDashboardCourse } from "@/lib/types";

// mockData.ts
export interface Application {
  id: number;
  name: string;
  email: string;
  expertise: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

// Mock Courses
export const mockCourses: TutorDashboardCourse[] = [
  { id: "1", title: "Complete React Masterclass", students: 2450, completionRate: 68, revenue: 24500, status: "published", rating: 4.8 },
  { id: "2", title: "Advanced TypeScript Patterns", students: 1280, completionRate: 45, revenue: 12800, status: "published", rating: 4.7 },
  { id: "3", title: "Node.js Backend Development", students: 980, completionRate: 52, revenue: 9800, status: "draft", rating: 0 },
  { id: "4", title: "GraphQL Fundamentals", students: 650, completionRate: 72, revenue: 6500, status: "published", rating: 4.9 },
];


// Mock Students
export const mockStudents = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", course: "React Masterclass", progress: 85, enrolledDate: "Nov 5, 2025" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", course: "TypeScript Patterns", progress: 60, enrolledDate: "Nov 12, 2025" },
  { id: 3, name: "Carol Williams", email: "carol@example.com", course: "React Masterclass", progress: 45, enrolledDate: "Nov 18, 2025" },
  { id: 4, name: "David Brown", email: "david@example.com", course: "GraphQL Fundamentals", progress: 92, enrolledDate: "Oct 28, 2025" },
  { id: 5, name: "Eva Martinez", email: "eva@example.com", course: "Node.js Backend", progress: 30, enrolledDate: "Nov 22, 2025" },
];


// Mock Applications
export const mockApplications: Application[] = [
  { id: 1, name: "Frank Lee", email: "frank@example.com", expertise: "Machine Learning", experience: "5 years", status: "pending", appliedDate: "Dec 1, 2025" },
  { id: 2, name: "Grace Kim", email: "grace@example.com", expertise: "Mobile Development", experience: "3 years", status: "pending", appliedDate: "Nov 28, 2025" },
  { id: 3, name: "Henry Chen", email: "henry@example.com", expertise: "Cloud Computing", experience: "7 years", status: "approved", appliedDate: "Nov 20, 2025" },
];