"use client";

// Newsletter Monday (design exploration section 04, stacked-blocks pattern).
// Three blocks to fill, a flip to see what families get, one send button.
// The owner types words and picks photos. The design is never her job.

import { useState } from "react";
import { BigButton, Card, Chip, ScreenHeader, StepNote, SuccessBanner, useMounted } from "@/components/preview/ui";
import { DEMO_PHOTOS } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

export default function NewsletterPage() {
  const mounted = useMounted();
  const newsletter = usePreviewStore((s) => s.newsletter);
  const updateNewsletterBlock = usePreviewStore((s) => s.updateNewsletterBlock);
  const addNewsletterBlock = usePreviewStore((s) => s.addNewsletterBlock);

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [chooserOpen, setChooserOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="Newsletter Monday"
          emoji="📰"
          note="Three blocks to fill. The design is never your job."
        />
        <StepNote step={8} text="Type in any block, then flip to see what families get." />

        <div className="mb-6 flex flex-wrap gap-3">
          <Chip label="Editing" on={mode === "edit"} onClick={() => setMode("edit")} />
          <Chip
            label="How families see it"
            on={mode === "preview"}
            onClick={() => setMode("preview")}
            onColor="var(--pv-plum)"
          />
        </div>

        {mounted && mode === "edit" ? (
          <div className="flex flex-col gap-4">
            {newsletter.map((block) => (
              <Card key={block.id}>
                <p
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "var(--pv-muted)" }}
                >
                  {block.label}
                </p>
                <input
                  type="text"
                  value={block.title}
                  onChange={(e) => updateNewsletterBlock(block.id, { title: e.target.value })}
                  placeholder="Give this block a title"
                  aria-label={`${block.label} title`}
                  className="pv-target mt-2 w-full rounded-xl border-2 px-4 py-3 text-lg font-bold"
                  style={{
                    borderColor: "var(--pv-line)",
                    color: "var(--pv-ink)",
                    backgroundColor: "var(--pv-card)",
                  }}
                />
                <textarea
                  value={block.body}
                  onChange={(e) => updateNewsletterBlock(block.id, { body: e.target.value })}
                  placeholder="Write a line or two"
                  aria-label={`${block.label} body`}
                  rows={3}
                  className="pv-target mt-3 w-full rounded-xl border-2 px-4 py-3 text-lg"
                  style={{
                    borderColor: "var(--pv-line)",
                    color: "var(--pv-ink)",
                    backgroundColor: "var(--pv-card)",
                  }}
                />
                {block.kind === "photos" ? (
                  <div className="mt-4">
                    <p className="text-base" style={{ color: "var(--pv-muted)" }}>
                      {"These photos come straight from the week's feed. You curate, you never hunt."}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {DEMO_PHOTOS.map((photo) => {
                        const inBlock = block.photoIds.includes(photo.id);
                        return (
                          <button
                            key={photo.id}
                            type="button"
                            aria-pressed={inBlock}
                            onClick={() => {
                              playClick();
                              const next = inBlock
                                ? block.photoIds.filter((id) => id !== photo.id)
                                : [...block.photoIds, photo.id];
                              updateNewsletterBlock(block.id, { photoIds: next });
                            }}
                            className="pv-press pv-target relative rounded-xl border-4 p-1 text-left"
                            style={{
                              borderColor: inBlock ? "var(--pv-teal)" : "transparent",
                              backgroundColor: "var(--pv-card)",
                            }}
                          >
                            <img
                              src={photo.src}
                              alt={photo.caption}
                              className="h-24 w-full rounded-xl object-cover"
                            />
                            {inBlock ? (
                              <span
                                className="absolute right-2 top-2 rounded-full px-2 py-1 text-sm font-bold text-white"
                                style={{ backgroundColor: "var(--pv-teal)" }}
                              >
                                ✓ In
                              </span>
                            ) : null}
                            <span
                              className="mt-1 block px-1 pb-1 text-sm font-semibold"
                              style={{ color: "var(--pv-ink)" }}
                            >
                              {photo.caption}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </Card>
            ))}

            {chooserOpen ? (
              <Card>
                <h2 className="text-xl">What kind of block?</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <BigButton
                    emoji="🌞"
                    label="Header"
                    color="var(--pv-plum)"
                    onClick={() => {
                      addNewsletterBlock("header");
                      setChooserOpen(false);
                    }}
                  />
                  <BigButton
                    emoji="📷"
                    label="Photos from the week"
                    color="var(--pv-teal)"
                    onClick={() => {
                      addNewsletterBlock("photos");
                      setChooserOpen(false);
                    }}
                  />
                  <BigButton
                    emoji="📌"
                    label="Reminders"
                    color="var(--pv-gold)"
                    onClick={() => {
                      addNewsletterBlock("reminders");
                      setChooserOpen(false);
                    }}
                  />
                </div>
              </Card>
            ) : (
              <BigButton
                emoji="＋"
                label="Add a block"
                color="var(--pv-sky)"
                onClick={() => setChooserOpen(true)}
              />
            )}
          </div>
        ) : null}

        {mounted && mode === "preview" ? (
          <Card className="mx-auto max-w-md">
            <div className="flex flex-col gap-6">
              {newsletter.map((block) => {
                if (block.kind === "photos") {
                  const chosen = DEMO_PHOTOS.filter((p) => block.photoIds.includes(p.id));
                  return (
                    <div key={block.id}>
                      {block.title ? (
                        <h3 className="text-xl font-extrabold">{block.title}</h3>
                      ) : null}
                      {block.body ? <p className="mt-1 text-base">{block.body}</p> : null}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {chosen.map((photo) => (
                          <div key={photo.id}>
                            <img
                              src={photo.src}
                              alt={photo.caption}
                              className="h-20 w-full rounded-xl object-cover"
                            />
                            <p
                              className="mt-1 text-sm font-semibold"
                              style={{ color: "var(--pv-muted)" }}
                            >
                              {photo.caption}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (block.kind === "reminders") {
                  return (
                    <div
                      key={block.id}
                      className="rounded-xl border-l-4 p-4"
                      style={{ borderColor: "var(--pv-gold)", backgroundColor: "#fbf3df" }}
                    >
                      {block.title ? (
                        <h3 className="text-xl font-extrabold">{block.title}</h3>
                      ) : null}
                      {block.body ? <p className="mt-1 text-base">{block.body}</p> : null}
                    </div>
                  );
                }
                return (
                  <div key={block.id}>
                    {block.title ? (
                      <h3 className="text-3xl font-extrabold">{block.title}</h3>
                    ) : null}
                    {block.body ? <p className="mt-2 text-lg">{block.body}</p> : null}
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}

        <div className="mt-8">
          <BigButton
            kiosk
            emoji="📨"
            label="Send to families"
            color="var(--pv-coral)"
            className="w-full"
            onClick={() =>
              setSuccess("Sent. In the real version every family gets this by email and text.")
            }
          />
        </div>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
