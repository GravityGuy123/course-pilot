// src/app/forgot-password/page.tsx
import ForgotPasswordClient from "@/components/forgot-password/ForgotPasswordClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | CoursePilot",
  description: "Request a password reset link to regain access to your account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}