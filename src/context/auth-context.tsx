"use client";

import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from "react";
import { LoginSchema } from "@/lib/schema";
import { authApi, bootstrapCsrf } from "@/lib/axios.config";

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  avatar?: string;
  is_email_verified: boolean;
  is_student?: boolean;
  is_tutor?: boolean;
  is_moderator?: boolean;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (data: LoginSchema) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(false);

  const checkAuth = useCallback(async () => {
    try {
      await bootstrapCsrf();
      const res = await authApi.get("/current-user/");
      if (mountedRef.current) setUser(res.data as User);
    } catch {
      if (mountedRef.current) setUser(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    checkAuth();

    return () => {
      mountedRef.current = false;
    };
  }, [checkAuth]);

  /**
   * OPTIONAL keep-alive refresh:
   * - Only run when tab is visible (reduces wasted calls)
   * - Don’t call checkAuth() every time
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!mountedRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

      try {
        await authApi.post("/refresh/");
        await bootstrapCsrf();
      } catch {
        setUser(null);
      }
    }, 7 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(
    async (data: LoginSchema) => {
      await bootstrapCsrf();
      await authApi.post("/login/", data);
      await bootstrapCsrf();
      await checkAuth();
    },
    [checkAuth]
  );

  const logout = useCallback(async () => {
    await bootstrapCsrf();
    await authApi.post("/logout/");
    setUser(null);
  }, []);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}