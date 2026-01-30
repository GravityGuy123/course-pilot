import { ProtectedRoute } from "@/components/routing/RouteGuard";

function VerifyEmailPage() {

    return (
        <section>
            <h1>Verify Email</h1>
            <p>Please check your email to verify your account.</p>
        </section>
    )
}


export default function VerifyEmailPageContent() {
  return (
    <ProtectedRoute>
      <VerifyEmailPage />
    </ProtectedRoute>
  );
}