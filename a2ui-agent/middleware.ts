import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 管理后台保护
  if (ADMIN_ROUTES.some((p) => pathname.startsWith(p))) {
    if (!req.auth) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if ((req.auth.user as { role?: string })?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
