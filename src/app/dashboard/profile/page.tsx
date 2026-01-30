"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import EmailVerificationForm from "@/components/auth/EmailVerificationForm";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function ProfilePage() {
    const auth = useContext(AuthContext);

    if (!auth) {
    throw new Error("AuthContext is missing. Wrap your component in <AuthContext.Provider>");
    }

    const user = auth.user as { id: number; username: string; email: string; is_email_verified?: boolean };

    if (auth.loading) return <div className="p-4">Loading...</div>;
    if (!auth.user) return <div className="p-4">Please sign in to view your profile.</div>;


  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Your profile</h1>
      <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <div className="mb-2"><strong>Email:</strong> {user.email}</div>
        <div className="mb-2"><strong>Username:</strong> {user.username}</div>
        <div className="mb-2"><strong>Verified:</strong> {String(user.is_email_verified ?? false)}</div>
      </div>

      {(user.is_email_verified) ? (
        <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">Your email is verified ✅</div>
      ) : (
        <EmailVerificationForm email={auth.user.email} onVerified={() => auth.checkAuth()} />
      )}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Notifications</h3>
        <NotificationsPanel />
      </div>
    </div>
  );
}

function NotificationsPanel() {
  type Note = { id: string; title: string; message: string; is_read: boolean; created_at?: string };
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await (await import('@/lib/axios.config')).api.get('/notifications');
        if (!mounted) return;
        setNotes(res.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  if (loading) return <div>Loading notifications...</div>;
  if (notes.length === 0) return <div className="text-sm text-gray-600">No notifications</div>;

  return (
    <ul className="space-y-2">
      {notes.map(n => (
        <li key={n.id} className={`p-2 border rounded ${n.is_read ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-gray-600">{n.message}</div>
            </div>
            {!n.is_read && (
              <button className="ml-4 px-2 py-1 bg-violet-600 text-white rounded" onClick={async () => {
                try {
                  await (await import('@/lib/axios.config')).api.post(`/notifications/${n.id}/read`);
                  setNotes((prev) => prev.map(p => p.id === n.id ? { ...p, is_read: true } : p));
                } catch {
                  // ignore
                }
              }}>Mark read</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}



export default function ProfilePageContent() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}