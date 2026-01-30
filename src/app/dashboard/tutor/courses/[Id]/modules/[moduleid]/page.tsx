import { ProtectedRoute } from "@/components/routing/RouteGuard";

function ModuleDetailsPage() {

    return (
        <div>
            <h1>Module Details Page</h1>
        </div>
    )
}

export default function ModuleDetailsPageContent() {
  return (
    <ProtectedRoute>
      <ModuleDetailsPage />
    </ProtectedRoute>
  );
}