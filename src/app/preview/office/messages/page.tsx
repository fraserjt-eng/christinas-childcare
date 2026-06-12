"use client";

// The office messages screen (director view). Christina reads each family's
// thread and writes back. A send writes to the shared store, so the family's
// phone shows the new message. A parent reply (from their phone) shows here
// too, which is the two-way thread the real app does not have yet.

import { useState } from "react";
import { Card, ScreenHeader, StepNote, SuccessBanner } from "@/components/preview/ui";
import { useMounted } from "@/components/preview/ui";
import { FAMILIES, type PreviewFamily } from "@/lib/preview/fixtures";
import { usePreviewStore, type PreviewMessage } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

export default function OfficeMessagesPage() {
  const mounted = useMounted();
  const threads = usePreviewStore((s) => s.threads);
  const sendToFamily = usePreviewStore((s) => s.sendToFamily);
  const markThreadRead = usePreviewStore((s) => s.markThreadRead);

  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  function openThread(familyId: string) {
    playClick();
    setOpenId((prev) => (prev === familyId ? null : familyId));
    markThreadRead(familyId);
  }

  function send(family: PreviewFamily) {
    const body = draft.trim();
    if (!body) return;
    sendToFamily(family.id, "Christina", body, true);
    setDraft("");
    setSuccess(`Sent to the ${family.name}. It is on their phone now.`);
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="Messages"
          emoji="💬"
          backHref="/preview/office"
          backLabel="The office"
          note="Read each family's thread and write back. They see it on their phone."
        />
        <StepNote step={9} text="Open the Brown family, send a note, then open their phone to see it." />

        <div className="flex flex-col gap-3">
          {FAMILIES.map((family) => {
            const thread: PreviewMessage[] = mounted ? threads[family.id] ?? [] : [];
            const latest = thread[0];
            const unread = mounted ? thread.filter((m) => m.unread && !m.fromOffice).length : 0;
            const open = openId === family.id;
            return (
              <Card key={family.id}>
                <button
                  type="button"
                  onClick={() => openThread(family.id)}
                  className="pv-press pv-target flex w-full items-center gap-3 text-left"
                >
                  <span aria-hidden="true" className="text-3xl">{family.avatar}</span>
                  <div className="flex-1">
                    <p className="text-lg font-extrabold">{family.name}</p>
                    <p className="text-sm" style={{ color: "var(--pv-muted)" }}>
                      {latest ? `${latest.fromOffice ? "You" : "They"}: ${latest.body}` : "No messages yet"}
                    </p>
                  </div>
                  {unread > 0 ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-extrabold text-white"
                      style={{ backgroundColor: "var(--pv-coral)" }}
                    >
                      {unread} new
                    </span>
                  ) : null}
                </button>

                {open ? (
                  <div className="mt-4">
                    <div className="flex flex-col gap-2">
                      {thread.map((m) => (
                        <div
                          key={m.id}
                          className={`max-w-[85%] rounded-2xl p-3 ${m.fromOffice ? "ml-auto text-white" : ""}`}
                          style={{
                            backgroundColor: m.fromOffice ? "var(--pv-sky)" : "#eef1f4",
                          }}
                        >
                          <p className="text-base">{m.body}</p>
                          <p className="mt-1 text-xs" style={{ color: m.fromOffice ? "rgba(255,255,255,0.85)" : "var(--pv-muted)" }}>
                            {m.fromOffice ? m.from : `${family.parentName.split(" ")[0]}`}, {m.time}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`Write to the ${family.name}`}
                        rows={2}
                        aria-label={`Write to the ${family.name}`}
                        className="rounded-xl border-2 px-4 py-3 text-base"
                        style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)" }}
                      />
                      <button
                        type="button"
                        disabled={!draft.trim()}
                        onClick={() => {
                          playClick();
                          send(family);
                        }}
                        className="pv-press pv-target rounded-xl px-4 py-3 text-base font-extrabold text-white disabled:opacity-50"
                        style={{ backgroundColor: "var(--pv-sky)" }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        <p className="mt-4 text-sm" style={{ color: "var(--pv-coral)" }}>
          To build. The center can send a one-way message today, but a parent
          writing back does not reach staff yet. This is the two-way thread.
        </p>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
