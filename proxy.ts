import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAccountRoute = createRouteMatcher(["/account(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isWebhookRoute = createRouteMatcher(["/api/webhooks/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isWebhookRoute(req)) return;

  if (isAdminRoute(req)) {
    await auth.protect();
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;
    if (role !== "ADMIN" && role !== "MANAGER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return;
  }

  if (isAccountRoute(req)) {
    await auth.protect();
    return;
  }

  // Redirect ADMIN/MANAGER away from storefront to admin dashboard
  if (!isApiRoute(req)) {
    const { userId, sessionClaims } = await auth();
    if (userId) {
      const role = sessionClaims?.metadata?.role;
      if (role === "ADMIN" || role === "MANAGER") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
