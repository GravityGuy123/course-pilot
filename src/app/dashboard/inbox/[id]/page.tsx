import InboxMessageClient from "@/components/inbox/InboxMessageClient";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

type Params = {
  id: string;
};

type PageProps = {
  params: Promise<Params>;
};

export default async function InboxDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <InboxMessageClient id={id} />
    </ProtectedRoute>
  );
}