"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/axios.config";
import { isAxiosError } from "axios";
import UserAvatar from "@/components/shared/UserAvatar";
import Image from "next/image";
import { userSettingsSchema, UserSettingsSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ErrorToast, SuccessToast } from "@/lib/toast";
import { ProtectedRoute } from "@/components/routing/RouteGuard";

function UserSettingsPage() {
  const { user, checkAuth, loading: authLoading } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserSettingsSchema>({
    resolver: zodResolver(userSettingsSchema),
    mode: "onChange",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Populate form when user loads
  useEffect(() => {
    if (!user) return;

    setValue("email", user.email);
    setValue("username", user.username);
    setValue("full_name", user.full_name);
    setValue("password", "");

    setAvatarPreview(user.avatar || null);
  }, [user, setValue]);

  const onSubmit = async (data: UserSettingsSchema) => {
    if (!user) return;

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("full_name", data.full_name);

    if (data.password) formData.append("password", data.password);
    if (data.avatar instanceof File) formData.append("avatar", data.avatar);

    try {
      await authApi.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      SuccessToast("Profile updated successfully", isDark);
      await checkAuth();
    } catch (err) {
      if (isAxiosError(err)) {
        const backendErrors = err.response?.data;
        if (backendErrors) {
          for (const key of Object.keys(backendErrors)) {
            if (key in data) {
              setError(key as keyof UserSettingsSchema, {
                type: "backend",
                message: backendErrors[key][0],
              });
            } else {
              ErrorToast(backendErrors[key][0], isDark);
            }
          }
        } else {
          ErrorToast(err.response?.data?.detail || "Update failed", isDark);
        }
      } else {
        ErrorToast("Something went wrong", isDark);
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl mt-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        User Settings
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="avatar"
                fill
                className="object-cover rounded-full border"
                sizes="80px"
                unoptimized
              />
            ) : (
              <UserAvatar user={user} size={80} />
            )}
          </div>

          <label className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
            Change Avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register("avatar")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue("avatar", file, { shouldValidate: true });
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>
        {errors.avatar && (
          <p className="text-sm text-red-600">
            {String(errors.avatar.message)}
          </p>
        )}

        {/* Full Name */}
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            type="text"
            disabled={isSubmitting}
            {...register("full_name")}
            className="w-full border rounded-md p-3 dark:bg-gray-700"
          />
          {errors.full_name && (
            <p className="text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block font-medium mb-1">Username</label>
          <input
            type="text"
            disabled={isSubmitting}
            {...register("username")}
            className="w-full border rounded-md p-3 dark:bg-gray-700"
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            disabled={isSubmitting}
            {...register("email")}
            className="w-full border rounded-md p-3 dark:bg-gray-700"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium mb-1">
            New Password (optional)
          </label>
          <input
            type="password"
            disabled={isSubmitting}
            {...register("password")}
            className="w-full border rounded-md p-3 dark:bg-gray-700"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-violet-600 text-white px-6 py-3 rounded-md hover:bg-violet-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}


export default function UserSettingsPageContent() {
  return (
    <ProtectedRoute>
      <UserSettingsPage />
    </ProtectedRoute>
  );
}