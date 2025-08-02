import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isAuthenticated as checkIsAuthenticated,
  clearSession,
  getDecodedSession,
} from "@/lib/authentication/auth";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/card",
  "/pos",
  "/users",
  "/agent",
  "/account",
  "/information",
  "/bill",
  "/command",
];
const adminProtectedRoutes = ["/agent/create-agent", "/admin"];
const publicRoutes = ["/login", "/signup"];
const changePasswordRoutes = ["/account/change-password"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // const isProtectedRoute = protectedRoutes.includes(path);
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  // const isAdminProtectedRoute = adminProtectedRoutes.includes(path);
  const isAdminProtectedRoute = adminProtectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isChangePasswordRoute = changePasswordRoutes.includes(path);

  const isAuthenticated = await checkIsAuthenticated();
  const sessionDecode = await getDecodedSession();

  if (!isAuthenticated) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
      await clearSession();
    }
  }

  if (isProtectedRoute && !sessionDecode && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (
    isAdminProtectedRoute &&
    sessionDecode?.role !== "admin" &&
    isAuthenticated
  ) {
    if (["/agent/create-agent"].includes(path)) {
      return NextResponse.redirect(new URL("/agent", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  if (
    isPublicRoute &&
    sessionDecode?._id &&
    isAuthenticated &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (
    isProtectedRoute &&
    !isChangePasswordRoute &&
    sessionDecode?.isChangedPassword === false &&
    isAuthenticated
  ) {
    return NextResponse.redirect(
      new URL("/account/change-password", req.nextUrl),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
