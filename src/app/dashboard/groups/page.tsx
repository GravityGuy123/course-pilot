import GroupsHero from "@/components/others/GroupsHero";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function GroupPage() {
  return (
    <section className="space-y-8">
      {/* Hero Section */}
      <GroupsHero />
    </section>
  );
}


export default function GroupPageContent() {
  return (
    <ProtectedRoute>
      <GroupPage />
    </ProtectedRoute>
  );
}