"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authApi } from "@/lib/axios.config";
import type { AxiosError } from "axios";

type Props = {
  email: string;
  onVerified?: () => void;
};

type ApiErrorPayload = { detail?: string };

const OTP_LEN = 6;

function sanitizeOtp(raw: string) {
  return (raw || "").replace(/\D/g, "").slice(0, OTP_LEN);
}

function isValidCode(raw: string) {
  return sanitizeOtp(raw).length === OTP_LEN;
}

function getAxiosMessage(err: unknown, fallback: string) {
  const axiosErr = err as AxiosError<ApiErrorPayload>;
  return axiosErr?.response?.data?.detail || axiosErr?.message || fallback;
}

export default function EmailVerificationForm({ email, onVerified }: Props) {
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(
    null
  );

  const [otp, setOtp] = useState<string[]>(() => Array.from({ length: OTP_LEN }, () => ""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const aliveRef = useRef(true);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hiddenOtpRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const safeSetStatus = useCallback(
    (next: { kind: "success" | "error"; text: string } | null) => {
      if (!aliveRef.current) return;
      setStatus(next);
    },
    []
  );

  const emailDisplay = useMemo(() => (email || "").trim(), [email]);
  const code = useMemo(() => otp.join(""), [otp]);
  const cleanedCode = useMemo(() => sanitizeOtp(code), [code]);

  const canSend = Boolean(emailDisplay) && !sending && cooldown === 0;
  const canVerify = Boolean(emailDisplay) && !verifying && isValidCode(cleanedCode);

  const focusIndex = useCallback((idx: number) => {
    const el = inputRefs.current[idx];
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const setOtpFromString = useCallback((value: string) => {
    const v = sanitizeOtp(value);
    const next = Array.from({ length: OTP_LEN }, (_, i) => v[i] || "");
    setOtp(next);
  }, []);

  const clearOtp = useCallback(() => {
    setOtp(Array.from({ length: OTP_LEN }, () => ""));
    window.setTimeout(() => focusIndex(0), 0);
  }, [focusIndex]);

  const sendCode = useCallback(async () => {
    if (!emailDisplay || sending || cooldown > 0) return;

    setSending(true);
    safeSetStatus(null);

    try {
      const res = await authApi.post("/email/send-code", { email: emailDisplay });

      if (res.status === 201) {
        safeSetStatus({ kind: "success", text: "Verification code sent to your email" });
        setCooldown(30); // UI throttle; backend should also rate-limit
        clearOtp();

        // Best-effort mobile OTP autofill prompt
        window.setTimeout(() => hiddenOtpRef.current?.focus(), 50);
        window.setTimeout(() => focusIndex(0), 80);
      } else {
        safeSetStatus({ kind: "error", text: "Unexpected response. Please try again." });
      }
    } catch (err: unknown) {
      safeSetStatus({ kind: "error", text: getAxiosMessage(err, "Error sending code") });
    } finally {
      if (aliveRef.current) setSending(false);
    }
  }, [clearOtp, cooldown, emailDisplay, focusIndex, safeSetStatus, sending]);

  const verify = useCallback(async () => {
    if (!emailDisplay || verifying) return;

    const cleaned = sanitizeOtp(code);
    if (!isValidCode(cleaned)) {
      safeSetStatus({ kind: "error", text: `Enter the ${OTP_LEN}-digit code.` });
      return;
    }

    setVerifying(true);
    safeSetStatus(null);

    try {
      const res = await authApi.post("/email/verify", { email: emailDisplay, code: cleaned });

      if (res.status === 200) {
        safeSetStatus({ kind: "success", text: "Email verified successfully!" });
        onVerified?.();
      } else {
        safeSetStatus({ kind: "error", text: "Invalid code" });
      }
    } catch (err: unknown) {
      safeSetStatus({ kind: "error", text: getAxiosMessage(err, "Error verifying code") });
    } finally {
      if (aliveRef.current) setVerifying(false);
    }
  }, [code, emailDisplay, onVerified, safeSetStatus, verifying]);

  const onBoxChange = useCallback(
    (index: number, raw: string) => {
      const incoming = sanitizeOtp(raw);

      // Pasted multiple digits into a box
      if (incoming.length > 1) {
        const next = [...otp];
        for (let i = 0; i < incoming.length && index + i < OTP_LEN; i++) {
          next[index + i] = incoming[i];
        }
        setOtp(next);

        const nextIndex = Math.min(index + incoming.length, OTP_LEN - 1);
        window.setTimeout(() => focusIndex(nextIndex), 0);

        const joined = sanitizeOtp(next.join(""));
        if (isValidCode(joined)) window.setTimeout(() => verify(), 50);
        return;
      }

      // Single digit
      const ch = incoming.slice(0, 1);
      const next = [...otp];
      next[index] = ch;
      setOtp(next);

      if (ch && index < OTP_LEN - 1) {
        window.setTimeout(() => focusIndex(index + 1), 0);
      }

      const joined = sanitizeOtp(next.join(""));
      if (isValidCode(joined)) window.setTimeout(() => verify(), 50);
    },
    [focusIndex, otp, verify]
  );

  const onBoxKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        verify();
        return;
      }

      if (e.key === "Backspace") {
        if (otp[index]) {
          const next = [...otp];
          next[index] = "";
          setOtp(next);
          return;
        }
        if (index > 0) {
          const next = [...otp];
          next[index - 1] = "";
          setOtp(next);
          window.setTimeout(() => focusIndex(index - 1), 0);
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (index > 0) focusIndex(index - 1);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (index < OTP_LEN - 1) focusIndex(index + 1);
        return;
      }
    },
    [focusIndex, otp, verify]
  );

  const onBoxPaste = useCallback(
    (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      const incoming = sanitizeOtp(text);
      if (!incoming) return;

      e.preventDefault();

      const next = [...otp];
      for (let i = 0; i < incoming.length && index + i < OTP_LEN; i++) {
        next[index + i] = incoming[i];
      }
      setOtp(next);

      const nextIndex = Math.min(index + incoming.length, OTP_LEN - 1);
      window.setTimeout(() => focusIndex(nextIndex), 0);

      const joined = sanitizeOtp(next.join(""));
      if (isValidCode(joined)) window.setTimeout(() => verify(), 50);
    },
    [focusIndex, otp, verify]
  );

  const statusIsSuccess = status?.kind === "success";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-violet-600 dark:text-violet-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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

        <span
          className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full truncate max-w-full sm:max-w-[240px]"
          title={emailDisplay}
        >
          {emailDisplay}
        </span>
      </div>

      {/* Hidden input for mobile OTP autofill (best-effort) */}
      <input
        ref={hiddenOtpRef}
        value={cleanedCode}
        onChange={(e) => setOtpFromString(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            type="button"
            onClick={sendCode}
            disabled={!canSend}
            className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-violet-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Send Code"}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed sm:max-w-[420px]">
            We’ll send a 6-digit code to your email. Check spam/junk if you don’t see it.
          </p>
        </div>

        {/* OTP Boxes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Enter code</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {cleanedCode.length}/{OTP_LEN}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {otp.map((val, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={val}
                onChange={(e) => onBoxChange(i, e.target.value)}
                onKeyDown={(e) => onBoxKeyDown(i, e)}
                onPaste={(e) => onBoxPaste(i, e)}
                inputMode="numeric"
                autoComplete="off"
                aria-label={`Verification code digit ${i + 1} of ${OTP_LEN}`}
                className={[
                  "h-11 w-11 sm:h-12 sm:w-12",
                  "rounded-lg border bg-white dark:bg-gray-800",
                  "text-center font-semibold",
                  "text-gray-900 dark:text-gray-100",
                  "border-gray-300 dark:border-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent",
                  "transition-all duration-200",
                ].join(" ")}
                maxLength={OTP_LEN} // allows pasting multiple digits into one box
              />
            ))}
          </div>

          {!isValidCode(cleanedCode) && cleanedCode.length > 0 ? (
            <p className="text-[11px] text-red-600 dark:text-red-400">
              Code must be exactly {OTP_LEN} digits.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={verify}
            disabled={!canVerify}
            className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {verifying ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verify
              </>
            )}
          </button>

          <button
            type="button"
            onClick={clearOtp}
            disabled={verifying || cleanedCode.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Status */}
      {status ? (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-lg flex items-start gap-2 ${
            statusIsSuccess
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          {statusIsSuccess ? (
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}

          <div className="min-w-0">
            <p
              className={`text-sm font-medium break-words ${
                statusIsSuccess
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {status.text}
            </p>

            {statusIsSuccess ? null : (
              <button
                type="button"
                onClick={() => safeSetStatus(null)}
                className="mt-2 text-xs font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 underline underline-offset-4"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}