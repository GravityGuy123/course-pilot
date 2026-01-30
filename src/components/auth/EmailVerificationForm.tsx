"use client";

import { useState } from "react";
import { authApi } from "@/lib/axios.config";
import type { AxiosError } from "axios";

export default function EmailVerificationForm({
  email,
  onVerified,
}: {
  email: string;
  onVerified?: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendCode = async () => {
    setSending(true);
    setStatus(null);
    try {
      const res = await authApi.post("/email/send-code", { email });
      if (res.status === 201) setStatus("Verification code sent to your email");
      else setStatus("Unexpected response");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setStatus(
        axiosErr.response?.data?.detail ||
          axiosErr.message ||
          "Error sending code"
      );
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    setStatus(null);
    try {
      const res = await authApi.post("/email/verify", { email, code });
      if (res.status === 200) {
        setStatus("Email verified successfully!");
        onVerified?.();
      } else {
        setStatus("Invalid code");
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      setStatus(
        axiosErr.response?.data?.detail ||
          axiosErr.message ||
          "Error verifying code"
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-violet-600 dark:text-violet-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Email Verification
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full truncate max-w-[180px]">
          {email}
        </span>
      </div>

      <div className="space-y-3">
        <button
          onClick={sendCode}
          disabled={sending}
          className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-violet-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send Code
            </>
          )}
        </button>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 8-character code"
            maxLength={8}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all duration-200"
          />

          <button
            onClick={verify}
            disabled={verifying || !code}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {verifying ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Verify
              </>
            )}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`p-3 rounded-lg flex items-start gap-2 ${
            status.includes("verified") || status.includes("sent")
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          {status.includes("verified") || status.includes("sent") ? (
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span
            className={`text-sm font-medium ${
              status.includes("verified") || status.includes("sent")
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
