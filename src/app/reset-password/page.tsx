import { Suspense } from "react";
import ResetPasswordClient from "@/components/reset-password/ResetPasswordClient";

export const dynamic = "force-dynamic"; // ensures Next won't try to SSG this route

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh]-">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-950 sm:p-8">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-6 h-11 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}