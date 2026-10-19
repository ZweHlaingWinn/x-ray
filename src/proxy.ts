import { NextResponse, type NextRequest } from "next/server"

// Optimistic check only: pages and server actions re-check the role themselves.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("xray_role")) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/records/:path*", "/worklist/:path*", "/qr-codes/:path*"],
}
