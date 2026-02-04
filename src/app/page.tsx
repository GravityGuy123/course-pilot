"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HomeHero from "@/components/home/HomeHero";
import { api } from "@/lib/axios.config";
import { FaBookOpen, FaCertificate, FaUsers } from "react-icons/fa";

interface Course {
  id: string;
  title: string;
  description: string;
  image?: string | null;
}

function normalizeBaseUrl(raw?: string) {
  const v = (raw || "http://localhost:8000").trim();
  if (!v) return "http://localhost:8000";
  return v.endsWith("/") ? v.slice(0, -1) : v;
}

function buildImageUrl(serverUrl: string, image?: string | null) {
  if (!image) return "/assets/course-placeholder.jpg";
  if (image.startsWith("http")) return image;
  // backend typically returns "/media/.."
  return `${serverUrl}${image}`;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Backend root (NOT /api)
  const SERVER_URL = useMemo(
    () => normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL),
    []
  );

  useEffect(() => {
    let alive = true;

    const fetchFeaturedCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<Course[]>("/courses/featured/");
        if (!alive) return;

        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!alive) return;
        setError("Failed to load featured courses. Please try again.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void fetchFeaturedCourses();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="w-full">
      <HomeHero />

      {/* Featured Courses */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-violet-600 dark:text-indigo-300 sm:text-3xl">
            Featured Courses
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Explore top picks curated for learners like you.
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="aspect-[16/9] w-full animate-pulse bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground sm:text-base">
              No featured courses available.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const imageUrl = buildImageUrl(SERVER_URL, course.image);

                return (
                  <article
                    key={course.id}
                    className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Link href={`/courses/${course.id}`} className="block">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                        <Image
                          src={imageUrl}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    </Link>

                    <div className="flex h-full flex-col p-5">
                      <h3 className="line-clamp-1 text-base font-semibold text-violet-700 dark:text-indigo-300 sm:text-lg">
                        {course.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                        {course.description}
                      </p>

                      <div className="mt-4">
                        <Link
                          href={`/courses/${course.id}`}
                          className="inline-flex items-center text-sm font-medium text-violet-700 hover:underline dark:text-indigo-300"
                        >
                          Learn More <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-violet-50 px-4 py-12 dark:bg-gray-900 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-6xl text-center">
          <h2 className="text-2xl font-bold text-violet-600 dark:text-indigo-300 sm:text-3xl">
            Earn Recognized Certifications
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300 sm:text-base">
            Stand out from the crowd with globally recognized certificates.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <FaCertificate className="h-7 w-7" />, title: "Professional Certificates" },
              { icon: <FaBookOpen className="h-7 w-7" />, title: "Specialization Paths" },
              { icon: <FaUsers className="h-7 w-7" />, title: "Industry Mentorship" },
            ].map((cert) => (
              <div
                key={cert.title}
                className="rounded-xl border bg-white p-6 text-center shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-gray-900 dark:text-indigo-300">
                  {cert.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                  {cert.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-14 text-center text-white dark:from-violet-700 dark:to-indigo-900 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-4xl">
            Ready to Start Learning?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/90 sm:text-lg">
            Join thousands of learners building skills for the future.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-white px-8 py-3 text-center text-base font-semibold text-violet-700 transition hover:bg-violet-700 hover:text-white sm:w-auto sm:text-lg"
            >
              Sign Up Today
            </Link>

            <Link
              href="/courses"
              className="w-full rounded-lg border border-white/60 px-8 py-3 text-center text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:text-lg"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}