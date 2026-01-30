"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/dashboard/general/CourseCard";
import GeneralDashboardAnnouncements from "@/components/dashboard/general/GeneralDashboardAnnouncements";
import GeneralDashboardPopularCertifications from "@/components/dashboard/general/GeneralDashboardPopularCertifications";
import { Category, DashboardCourse } from "@/lib/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import DashboardRoleApplication from "@/components/dashboard/shared/DashboardRoleApplication";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

/* ---------- MANUAL DATA ---------- */
const manualCourses: DashboardCourse[] = [
  {
    id: "1",
    title: "Full Stack Web Development",
    description:
      "Build complete web applications with Node.js, Express, and MongoDB",
    tutor: "James Rodriguez",
    level: "Advanced",
    duration: "20 weeks",
    price: 135000,
    thumbnail_url: "/assets/full-stack-web-1.jpeg",
    category_id: "1",
  },
  {
    id: "2",
    title: "Python for Data Science",
    description:
      "Learn Python programming with focus on data analysis, visualization, and machine learning",
    tutor: "Michael Chen",
    level: "Beginner",
    duration: "10 weeks",
    price: 90000,
    thumbnail_url: "/assets/python-data-science-1.jpeg",
    category_id: "2",
  },
  {
    id: "3",
    title: "iOS App Development with Swift",
    description: "Build professional iOS applications using Swift and SwiftUI",
    tutor: "Emma Wilson",
    level: "Intermediate",
    duration: "14 weeks",
    price: 120000,
    thumbnail_url: "/assets/ios-app-dev-1.jpeg",
    category_id: "1",
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description:
      "Master the principles of user interface and user experience design",
    tutor: "David Kim",
    level: "Beginner",
    duration: "8 weeks",
    price: 60000,
    thumbnail_url: "/assets/ui-ux-design-1.jpeg",
    category_id: "3",
  },
  {
    id: "5",
    title: "Machine Learning A-Z",
    description:
      "Comprehensive guide to machine learning algorithms and applications",
    tutor: "Dr. Lisa Anderson",
    level: "Advanced",
    duration: "16 weeks",
    price: 150000,
    thumbnail_url: "/assets/machine-learning-1.jpeg",
    category_id: "2",
  },
  {
    id: "6",
    title: "Complete React Development",
    description:
      "Master React from basics to advanced concepts including hooks, context, and Redux",
    tutor: "Sarah Johnson",
    level: "Intermediate",
    duration: "12 weeks",
    price: 75000,
    thumbnail_url: "/assets/complete-react-development-1.jpeg",
    category_id: "1",
  },
];

const manualCategories: Category[] = [
  {
    id: "1",
    name: "Technology",
    description: "Programming, software development, and IT-related courses",
  },
  {
    id: "2",
    name: "Data Science",
    description: "Data analysis, machine learning, and AI-focused courses",
  },
  {
    id: "3",
    name: "Design",
    description: "UI, UX, graphics, and creative design courses",
  },
  {
    id: "4",
    name: "Business",
    description: "Entrepreneurship, management, and business strategy",
  },
  {
    id: "5",
    name: "Marketing",
    description: "Digital marketing, branding, and growth strategies",
  },
  {
    id: "6",
    name: "Personal Development",
    description: "Self-improvement, productivity, and life skills",
  },
  {
    id: "7",
    name: "Photography",
    description: "Photography techniques, editing, and visual storytelling",
  },
  {
    id: "8",
    name: "Health & Fitness",
    description: "Wellness, fitness training, and healthy living",
  },
];

function GeneralDashboardPage() {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  /* ---------- AUTH GUARD ---------- */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  /* ---------- LOADING STATE ---------- */
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Loading dashboard…
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Fetching your account data…
        </p>
      </div>
    );
  }

  /* ---------- NOT LOGGED IN STATE ---------- */
  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold">Not logged in</h2>
        <p className="text-muted-foreground">
          Please log in to access the general dashboard.
        </p>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
        <p className="text-xs text-muted-foreground">
          Redirecting automatically…
        </p>
      </div>
    );
  }

  /* ---------- DASHBOARD UI ---------- */
  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-violet-50 via-indigo-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl p-6 md:p-8 text-gray-900 dark:text-gray-100 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2">
          Welcome to Course-Pilot!
        </h1>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
          Discover thousands of courses from expert instructors. Start your
          learning journey today and unlock your potential.
        </p>
      </div>

      <GeneralDashboardAnnouncements />

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-gray-100">
            Browse Categories
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/courses"
              className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {manualCategories.map((c) => (
            <Card
              key={c.id}
              className="hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-500 transition-all cursor-pointer group rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <CardContent className="p-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-violet-50 dark:bg-violet-900 rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-800 transition-colors">
                  <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                </div>
                <span>{c.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-gray-100">
            Featured Courses
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/courses"
              className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {manualCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              title={course.title}
              description={course.description}
              tutor={course.tutor}
              thumbnail={course.thumbnail_url}
              category="Technology"
              level={course.level}
              duration={course.duration}
              price={course.price}
              featured={index === 0}
              studentCount={Math.floor(Math.random() * 5000) + 500}
              rating={4 + Math.random()}
              onEnroll={() => {}}
              onView={() => {}}
            />
          ))}
        </div>
      </section>

      <GeneralDashboardPopularCertifications />
      <DashboardRoleApplication />
    </div>
  );
}


export default function GeneralDashboardPageContent() {
  return (
    <ProtectedRoute>
      <GeneralDashboardPage />
    </ProtectedRoute>
  );
}