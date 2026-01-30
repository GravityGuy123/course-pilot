"use client";

import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/axios.config";
import { registerFormSchema, RegisterSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import UserInfoFields from "@/components/auth/signup/UserInfoFields";
import PasswordFields from "@/components/auth/signup/PasswordFields";
import AvatarField from "@/components/auth/signup/AvatarField";
import { useTheme } from "next-themes";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirm_password", data.confirm_password);

      const avatarInput = (document.querySelector(
        'input[name="avatar"]'
      ) as HTMLInputElement)?.files?.[0];
      if (avatarInput) formData.append("avatar", avatarInput);

      await authApi.post("/auth/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful! Login", {
        position: "top-right",
        className:
          "text-white bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500 px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
        style: {
          backgroundColor: isDark ? "#7c3aed" : "#8b5cf6",
          color: "#fff",
        },
      });

      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      // Proper type narrowing
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as Record<string, string[] | string> | undefined;

        if (responseData) {
          // Map backend validation errors to form fields
          (Object.keys(responseData) as Array<keyof RegisterSchema>).forEach(
            (field) => {
              const message = Array.isArray(responseData[field])
                ? responseData[field][0]
                : (responseData[field] as string);
              setError(field, { type: "server", message });
            }
          );
          return;
        }
      }

      toast.error("Registration failed", {
        position: "top-center",
        className:
          "bg-red-600 dark:bg-red-500 text-white border-red-300/20 dark:border-red-400/20",
        style: { backgroundColor: isDark ? "#ef4444" : "#f87171", color: "#fff" },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Sign Up
        </h2>

        <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <UserInfoFields register={register} errors={errors} isSubmitting={isSubmitting} />
          <PasswordFields register={register} errors={errors} isSubmitting={isSubmitting} />
          <AvatarField register={register} errors={errors} isSubmitting={isSubmitting} />

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition flex justify-center items-center"
          >
            {isSubmitting ? <Spinner /> : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="grow border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-gray-500 dark:text-gray-400 text-sm">or</span>
          <hr className="grow border-gray-300 dark:border-gray-600" />
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <FaGoogle className="text-red-500" size={18} />
          Sign up with Google
        </button>

        <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-violet-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}