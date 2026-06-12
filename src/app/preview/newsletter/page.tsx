"use client";

// Newsletter Monday (design exploration section 04, stacked-blocks pattern).
// Three blocks to fill, a flip to see what families get, one send button.
// The owner types words and picks photos. The design is never her job.

import { useEffect, useRef, useState } from "react";
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
                <DebouncedText
                  as="input"
                  value={block.title}
                  onCommit={(next) => updateNewsletterBlock(block.id, { title: next })}
                  placeholder="Give this block a title"
                  ariaLabel={`${block.label} title`}
                  className="pv-target mt-2 w-full rounded-xl border-2 px-4 py-3 text-lg font-bold"
                />
                <DebouncedText
                  as="textarea"
                  value={block.body}
                  onCommit={(next) => updateNewsletterBlock(block.id, { body: next })}
                  placeholder="Write a line or two"
                  ariaLabel={`${block.label} body`}
                  className="pv-target mt-3 w-full rounded-xl border-2 px-4 py-3 text-lg"
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

/** Locally controlled text field so typing stays smooth.
 *  Each keystroke updates only this field's own state. The store hears about
 *  it on blur and through a 400ms debounce, which keeps the family-view flip
 *  fresh without re-rendering every block and the photo grid per character.
 *  If the field unmounts mid-debounce (say, flipping to the family view
 *  right after typing) the pending text still commits. No sound on typing. */
function DebouncedText({
  as,
  value,
  placeholder,
  ariaLabel,
  className,
  onCommit,
}: {
  as: "input" | "textarea";
  value: string;
  placeholder: string;
  ariaLabel: string;
  className: string;
  onCommit: (next: string) => void;
}) {
  const [text, setText] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef({ text: value, dirty: false, onCommit });

  // Keep the latest commit callback without retriggering effects.
  useEffect(() => {
    pendingRef.current.onCommit = onCommit;
  });

  // If the store changes underneath an idle field (Reset Demo), follow it.
  useEffect(() => {
    if (!pendingRef.current.dirty) {
      pendingRef.current.text = value;
      setText(value);
    }
  }, [value]);

  // Flush any pending text if the field unmounts before the debounce fires.
  // The pending object keeps one identity for the field's whole life, so
  // capturing it here is safe and keeps the lint rule satisfied.
  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pending.dirty) {
        pending.dirty = false;
        pending.onCommit(pending.text);
      }
    };
  }, []);

  const commitNow = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingRef.current.dirty) {
      pendingRef.current.dirty = false;
      pendingRef.current.onCommit(pendingRef.current.text);
    }
  };

  const handleChange = (next: string) => {
    setText(next);
    pendingRef.current.text = next;
    pendingRef.current.dirty = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(commitNow, 400);
  };

  const fieldStyle = {
    borderColor: "var(--pv-line)",
    color: "var(--pv-ink)",
    backgroundColor: "var(--pv-card)",
  };

  if (as === "textarea") {
    return (
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commitNow}
        placeholder={placeholder}
        aria-label={ariaLabel}
        rows={3}
        className={className}
        style={fieldStyle}
      />
    );
  }
  return (
    <input
      type="text"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={commitNow}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
      style={fieldStyle}
    />
  );
}
