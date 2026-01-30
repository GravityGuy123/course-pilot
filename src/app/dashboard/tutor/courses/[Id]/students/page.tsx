import { ProtectedRoute } from "@/components/routing/RouteGuard";

function TutorStudentsPage() {

    return (
        <section>
            <h1>Tutor Students Page </h1> 
        </section>
    )
}


export default function TutorStudentsPageContent() {
  return (
    <ProtectedRoute>
      <TutorStudentsPage />
    </ProtectedRoute>
  );
}