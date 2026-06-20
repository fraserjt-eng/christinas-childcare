import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./preview.css";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import LivePortalHydrator from "@/components/preview/LivePortalHydrator";
import CenterWatermark from "@/components/preview/CenterWatermark";

// The production portal. Logged-in surfaces require a real auth_session; the
// route protection in src/middleware.ts redirects an unauthenticated visitor to
// the login. The public kiosk/landing/door surfaces are left out of that map.
export const metadata: Metadata = {
  title: {
    default: "Christina's Child Care Center",
    template: "%s | Christina's Child Care Center",
  },
};

export default function PreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The chrome (sign-out, brand) only makes sense for a signed-in user. The
  // public surfaces (kiosk/landing/door) render their own bare layout, so the
  // chrome here keys off a real session cookie. Middleware is the actual gate;
  // this is presentation only.
  const signedIn = Boolean(cookies().get("auth_session")?.value);

  return (
    <div className="pv-root">
      {signedIn ? (
        <>
          <LivePortalHydrator />
          <CenterWatermark />
          <PreviewChrome>{children}</PreviewChrome>
        </>
      ) : (
        children
      )}
    </div>
  );
}
