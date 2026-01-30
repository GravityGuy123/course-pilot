import { ProtectedRoute } from "@/components/routing/RouteGuard";

function CourseAnalyticsPage() {

    return (
        <section>
            <h1>Course Analytics Page</h1>
        </section>
    )
}


export default function CourseAnalyticsPageContent() {
  return (
    <ProtectedRoute>
      <CourseAnalyticsPage />
    </ProtectedRoute>
  );
}