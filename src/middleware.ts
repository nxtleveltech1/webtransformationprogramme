import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// `/api/alerts/run` is invoked by an external scheduler (e.g. Vercel cron) that
// has no Clerk session; it self-protects with a bearer secret inside the
// handler, so it must bypass Clerk's session protection here.
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/alerts/run",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
