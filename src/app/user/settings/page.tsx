"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useTheme } from "next-themes";

import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/axios.config";
import { ErrorToast, SuccessToast } from "@/lib/toast";
import UserAvatar from "@/components/shared/UserAvatar";
import { ProtectedRoute } from "@/components/routing/RouteGuard";
import { userSettingsSchema, UserSettingsSchema } from "@/lib/schema";

function getFirstErrorMessage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
  }

  return null;
}

function UserSettingsPage() {
  const { user, checkAuth, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = useMemo(() => theme === "dark", [theme]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const fileInputElRef = useRef<HTMLInputElement | null>(null);

  const fullNameId = useId();
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const avatarId = useId();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    resetField,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserSettingsSchema>({
    resolver: zodResolver(userSettingsSchema),
    mode: "onChange",
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
      avatar: undefined,
    },
  });

  useEffect(() => {
    if (!user) return;

    const defaults: UserSettingsSchema = {
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      password: "",
      avatar: undefined,
    };

    reset(defaults, { keepDirty: false, keepErrors: false });

    // Backend already returns absolute URL via build_absolute_uri, so use it directly.
    setAvatarPreview(user.avatar || null);

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (fileInputElRef.current) {
      fileInputElRef.current.value = "";
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    };
  }, []);

  const avatarField = register("avatar");

  const resetAvatarUiOnly = () => {
    clearErrors("avatar");

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    resetField("avatar", { defaultValue: undefined });
    setAvatarPreview(null);

    if (fileInputElRef.current) {
      fileInputElRef.current.value = "";
    }
  };

  const setAvatarFile = (file?: File) => {
    clearErrors("avatar");

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (!file) {
      resetAvatarUiOnly();
      return;
    }

    setValue("avatar", file, { shouldDirty: true, shouldValidate: true });

    const url = URL.createObjectURL(file);
    previewObjectUrlRef.current = url;
    setAvatarPreview(url);
  };

  const removeAvatarPermanently = async () => {
    if (!user) return;

    // Clear UI immediately
    resetAvatarUiOnly();

    const formData = new FormData();
    formData.append("remove_avatar", "true");

    try {
      await authApi.put("/users/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      SuccessToast("Avatar removed", isDark);
      await checkAuth();
    } catch (err) {
      ErrorToast("Failed to remove avatar", isDark);
      // restore current backend avatar if remove failed
      setAvatarPreview(user.avatar || null);
    }
  };

  const onSubmit = async (data: UserSettingsSchema) => {
    if (!user) return;

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("full_name", data.full_name);

    if (data.password && data.password.trim().length > 0) {
      formData.append("password", data.password);
    }

    if (data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    }

    try {
      await authApi.put("/users/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      SuccessToast("Profile updated successfully", isDark);
      await checkAuth();
    } catch (err) {
      if (isAxiosError(err)) {
        const payload = err.response?.data;

        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          const obj = payload as Record<string, unknown>;
          let handledAnyField = false;

          const allowedKeys: Array<keyof UserSettingsSchema> = [
            "email",
            "username",
            "full_name",
            "password",
            "avatar",
          ];

          for (const key of allowedKeys) {
            const msg = getFirstErrorMessage(obj[key as string]);
            if (!msg) continue;
            handledAnyField = true;
            setError(key, { type: "server", message: msg });
          }

          if (!handledAnyField) {
            const general =
              getFirstErrorMessage(payload) ||
              getFirstErrorMessage(obj.detail) ||
              "Update failed";
            ErrorToast(general, isDark);
          }
          return;
        }

        const fallback =
          getFirstErrorMessage(payload) ||
          err.response?.statusText ||
          "Update failed";
        ErrorToast(fallback, isDark);
        return;
      }

      ErrorToast("Something went wrong", isDark);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="h-8 w-44 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="mt-8 space-y-6">
              <div className="h-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You’re not signed in.
          </p>
        </div>
      </div>
    );
  }

  const showRemoveButton = Boolean(user.avatar) || Boolean(avatarPreview);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-2xl border bg-white dark:bg-gray-900 shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              User Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Update your profile details and avatar. Changes reflect across
              CoursePilot.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <fieldset disabled={isSubmitting} className="space-y-6">
              <div className="rounded-xl border p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Your avatar"
                          fill
                          className="rounded-full object-cover border"
                          sizes="80px"
                          unoptimized
                          priority
                        />
                      ) : (
                        <UserAvatar user={user} size={80} className="w-full h-full" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Profile photo
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        JPEG/PNG/WEBP • Max 2MB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor={avatarId}
                      className="inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50"
                    >
                      Change avatar
                    </label>

                    {showRemoveButton ? (
                      <button
                        type="button"
                        onClick={removeAvatarPermanently}
                        className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : null}

                    <input
                      id={avatarId}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      name={avatarField.name}
                      ref={(el) => {
                        avatarField.ref(el);
                        fileInputElRef.current = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setAvatarFile(file);
                      }}
                    />
                  </div>
                </div>

                {errors.avatar?.message ? (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    {String(errors.avatar.message)}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label
                  htmlFor={fullNameId}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Full name
                </label>
                <input
                  id={fullNameId}
                  type="text"
                  autoComplete="name"
                  {...register("full_name")}
                  className="w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
                {errors.full_name?.message ? (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.full_name.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label
                  htmlFor={usernameId}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Username
                </label>
                <input
                  id={usernameId}
                  type="text"
                  autoComplete="username"
                  {...register("username")}
                  className="w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
                {errors.username?.message ? (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.username.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label
                  htmlFor={emailId}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Email
                </label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  {...register("email")}
                  className="w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
                {errors.email?.message ? (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label
                  htmlFor={passwordId}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  New password{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    (optional)
                  </span>
                </label>
                <input
                  id={passwordId}
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
                {errors.password?.message ? (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.password.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to keep your current password.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isDirty
                    ? "You have unsaved changes."
                    : "Your profile is up to date."}
                </p>

                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
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