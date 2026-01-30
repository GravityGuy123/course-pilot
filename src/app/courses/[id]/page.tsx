"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { CourseComponent } from "@/components/courses/CourseComponent";
import { api } from "@/lib/axios.config";
import { CoursePageDetails } from "@/lib/types";

export default function PublicCourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CoursePageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<CoursePageDetails>(
          `/courses/${id}`
        );
        setCourse(res.data);
      } catch (err: unknown) {
        let message = "An unexpected error occurred.";

        if (typeof err === "object" && err !== null) {
          const axiosErr = err as {
            response?: { status?: number; data?: { detail?: string } };
            message?: string;
          };

          if (axiosErr.response?.status === 404) {
            message = "Course does not exist.";
          } else if (axiosErr.response?.status === 403) {
            message = "You do not have permission to view this course.";
          } else if (axiosErr.message) {
            message = axiosErr.message;
          }
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="w-12 h-12 text-violet-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!course) {
    return (
      <div className="text-center text-gray-500 mt-10">Course not found.</div>
    );
  }

  return <CourseComponent course={course} />;
}

// export default async function PublicCourseDetailsPage({
//   params,
// }: CoursePageProps) {
//   // Must use await even when u are told not to because the request needs to be waited for
//   const { id } = await params;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
//       <div className="max-w-5xl mx-auto">
//         <Suspense
//           fallback={
//             <div className="flex justify-center items-center h-96">
//               <Spinner className="w-12 h-12 text-violet-600" />
//             </div>
//           }
//         >
//           <div>
//             <GetCourseComponent id={id} />
//           </div>
//         </Suspense>
//       </div>
//     </div>
//   );
// }
