"use server";

// Passcode gate for the /preview layer. The code lives ONLY in the
// PREVIEW_PASSCODE env var (Preview target on Vercel; .env.local or the
// dev fallback locally). The repo is public on GitHub, so no secret may
// ever be committed. This gate protects demo fixtures, nothing sensitive.

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface GateResult {
  error: string | null;
}

export async function enterPreview(
  _prev: GateResult,
  formData: FormData,
): Promise<GateResult> {
  const expected =
    process.env.PREVIEW_PASSCODE ??
    (process.env.NODE_ENV === "development" ? "preview" : null);

  if (!expected) {
    return { error: "The preview is not open yet. Ask Josh to set the preview code." };
  }

  const given = String(formData.get("passcode") ?? "").trim();
  if (given !== expected) {
    return { error: "That code did not match. Try again." };
  }

  cookies().set("cc_preview", "open", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/preview",
  });
  revalidatePath("/preview", "layout");
  return { error: null };
}
