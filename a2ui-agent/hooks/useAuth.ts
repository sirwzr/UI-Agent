"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: (session?.user as { role?: string })?.role === "admin",
    refresh: update,
  };
}
