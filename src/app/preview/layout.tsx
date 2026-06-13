import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./preview.css";
import { PreviewChrome } from "@/components/preview/PreviewChrome";
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
  const unlocked = cookies().get("cc_preview")?.value === "open";

  return (
    <div className="pv-root">
      {unlocked ? <PreviewChrome>{children}</PreviewChrome> : <GateForm />}
    </div>
  );
}
