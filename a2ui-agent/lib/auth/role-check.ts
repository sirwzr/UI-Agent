import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth/auth";

export function requireAdmin() {
  return auth((req) => {
    const role = (req.auth?.user as { role?: UserRole })?.role;
    if (!req.auth || role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  });
}

export function checkAdminRole(role?: string): role is "admin" {
  return role === "admin";
}
