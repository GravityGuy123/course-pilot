import { toast } from "sonner";
import { ToastOptions } from "./types";


// SUCCESS TOAST
export const SuccessToast = (
  message: string,
  isDark: boolean,
  options?: ToastOptions
) => {
  toast(message, {
    position: options?.position ?? "top-right",
    className:
      "text-white px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
    style: {
      backgroundColor: isDark ? "#8b5cf6" : "#7c3aed",
      color: "#ffffff",
    },
  });
};

// ERROR TOAST
export const ErrorToast = (
  message: string,
  isDark: boolean,
  options?: ToastOptions
) => {
  toast(message, {
    position: options?.position ?? "top-right",
    className:
      "text-white px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
    style: {
      backgroundColor: isDark ? "#ef4444" : "#f87171",
      color: "#ffffff",
    },
  });
};

// WARNING TOAST
export const WarningToast = (
  message: string,
  isDark: boolean,
  options?: ToastOptions
) => {
  toast(message, {
    position: options?.position ?? "top-right",
    className:
      "text-white px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
    style: {
      backgroundColor: isDark ? "#facc15" : "#eab308",
      color: "#ffffff",
    },
  });
};

// INFO TOAST
export const InfoToast = (
  message: string,
  isDark: boolean,
  options?: ToastOptions
) => {
  toast(message, {
    position: options?.position ?? "top-right",
    className:
      "text-white px-4 py-3 rounded-xl shadow-lg border border-white/20 font-medium",
    style: {
      backgroundColor: isDark ? "#3b82f6" : "#2563eb",
      color: "#ffffff",
    },
  });
};