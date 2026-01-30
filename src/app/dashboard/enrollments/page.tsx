"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/axios.config';
import { Enrollment } from '@/lib/types';
import { ProtectedRoute } from '@/components/routing/RouteGuard';

function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/my-enrollments');
        if (!mounted) return;
        setEnrollments(res.data || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (enrollments.length === 0) return <div className="p-4">You have no enrollments</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Enrollments</h1>
      <ul className="space-y-4">
        {enrollments.map(e => (
          <li key={e.id} className="p-4 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{e.course.title}</div>
                <div className="text-sm text-gray-600">Progress: {e.progress}%</div>
              </div>
              <div>
                <a className="text-violet-600 hover:underline" href={`/courses/${e.course.id}`}>View course</a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}



export default function EnrollmentsPageContent() {
  return (
    <ProtectedRoute>
      <EnrollmentsPage />
    </ProtectedRoute>
  );
}