


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as cookie from "cookie";

export function middleware(request: NextRequest) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");

  const sessionToken = cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];

  const protectedRoutes = ["/notes", "/yt-video"];

  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/yt-video/:path*"],
};