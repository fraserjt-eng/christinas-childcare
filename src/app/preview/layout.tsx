import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./preview.css";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
import LivePortalHydrator from "@/components/preview/LivePortalHydrator";
import CenterWatermark from "@/components/preview/CenterWatermark";
import { GateForm } from "./GateForm";

// Sealed preview namespace. Gated by PREVIEW_PASSCODE, fixtures only,
// never indexed. See docs/preview/PLAN.md for the isolation contract.
export const metadata: Metadata = {
  title: {
    default: "Summer Version 1 | Preview",
    template: "%s | Preview",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Unlock for the demo passcode OR for a signed-in user. A staff member
  // reviewing the real portal skips the demo veil; the live data behind it is
  // still session-gated at /api/portal/center-data.
  const unlocked =
    cookies().get("cc_preview")?.value === "open" ||
    Boolean(cookies().get("auth_session")?.value);

  return (
    <div className="pv-root">
      {unlocked ? (
        <>
          <LivePortalHydrator />
          <CenterWatermark />
          <PreviewChrome>{children}</PreviewChrome>
        </>
      ) : (
        <GateForm />
      )}
    </div>
  );
}
