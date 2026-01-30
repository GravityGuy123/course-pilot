import InboxHero from "@/components/inbox/InboxHero";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function InboxPage() {
  return (
    <section className="w-full space-y-8">
      {/* Hero Section */}
      <InboxHero />

    </section>
  );
}


export default function InboxPageContent() {
  return (
    <ProtectedRoute>
      <InboxPage />
    </ProtectedRoute>
  );
}