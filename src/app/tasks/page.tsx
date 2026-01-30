import TaskHero from "@/components/others/TaskHero";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function TaskPage() {
  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <TaskHero />
    </section>
  );
}


export default function TaskPageContent() {
  return (
    <ProtectedRoute>
      <TaskPage />
    </ProtectedRoute>
  );
}