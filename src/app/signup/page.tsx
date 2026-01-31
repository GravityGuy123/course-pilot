"use client";

import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTheme } from "next-themes";
import axios from "axios";
import { toast } from "sonner";

import { authApi, bootstrapCsrf } from "@/lib/axios.config";
import { registerFormSchema, RegisterSchema } from "@/lib/schema";
import { Spinner } from "@/components/ui/spinner";
import UserInfoFields from "@/components/auth/signup/UserInfoFields";
import PasswordFields from "@/components/auth/signup/PasswordFields";
import AvatarField from "@/components/auth/signup/AvatarField";

type RegisterForm = RegisterSchema & {
  avatar?: FileList;
};

export default function SignupPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit: SubmitHandler<RegisterForm> = async (data) => {
    try {
      await bootstrapCsrf();

      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirm_password", data.confirm_password);

      const avatarFile = data.avatar?.[0];
      if (avatarFile) formData.append("avatar", avatarFile);

      await authApi.post("/register/", formData, {
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

      setTimeout(() => router.push("/login"), 1200);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as Record<string, string[] | string> | undefined;

        if (responseData) {
          (Object.keys(responseData) as Array<keyof RegisterSchema>).forEach((field) => {
            const val = responseData[field];
            const message = Array.isArray(val) ? val[0] : val;
            if (typeof message === "string" && message.trim()) {
              setError(field, { type: "server", message });
            }
          });
          return;
        }
      }

      toast.error("Registration failed", {
        position: "top-center",
        className: "bg-red-600 dark:bg-red-500 text-white border-red-300/20 dark:border-red-400/20",
        style: { backgroundColor: isDark ? "#ef4444" : "#f87171", color: "#fff" },
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <UserInfoFields register={register} errors={errors} isSubmitting={isSubmitting} />
          <PasswordFields register={register} errors={errors} isSubmitting={isSubmitting} />
          <AvatarField register={register} errors={errors} isSubmitting={isSubmitting} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-violet-600 py-2 font-medium text-white transition hover:bg-violet-700 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isSubmitting ? <Spinner /> : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <hr className="grow border-gray-300 dark:border-gray-600" />
          <span className="px-2 text-sm text-gray-500 dark:text-gray-400">or</span>
          <hr className="grow border-gray-300 dark:border-gray-600" />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <FaGoogle className="text-red-500" size={18} />
          Sign up with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-violet-600 hover:underline dark:text-indigo-400"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}