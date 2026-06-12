"use client";

// People, three verbs only (design exploration section 07).
// Add a person, reset a code, tap a row for their room. That is the
// whole screen. Reports and deeper settings live in Josh's layer.

import { useState } from "react";
import {
  BigButton,
  Card,
  Chip,
  ScreenHeader,
  StepNote,
  SuccessBanner,
  useMounted,
} from "@/components/preview/ui";
import { ROOMS, roomById, type PreviewStaff } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

function staffSub(person: PreviewStaff): string {
  if (person.role === "owner") return "Owner";
  const room = person.roomId ? roomById(person.roomId) : null;
  return room ? `Teacher, ${room.name}` : "Teacher, floats between rooms";
}

export default function PeoplePage() {
  const mounted = useMounted();
  const staff = usePreviewStore((s) => s.staff);
  const families = usePreviewStore((s) => s.families);
  const setStaffRoom = usePreviewStore((s) => s.setStaffRoom);
  const addPerson = usePreviewStore((s) => s.addPerson);

  const [openStaffId, setOpenStaffId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newKind, setNewKind] = useState<"staff" | "family">("staff");
  const [newName, setNewName] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  function toggleRow(staffId: string) {
    playClick();
    setOpenStaffId((current) => (current === staffId ? null : staffId));
  }

  function resetCode() {
    playClick();
    setSuccess("New code created. It prints at the front desk.");
  }

  function closeForm() {
    setAdding(false);
    setNewName("");
    setNewKind("staff");
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <ScreenHeader
          title="People"
          emoji="🧑🏾‍🤝‍🧑🏾"
          backHref="/preview/office"
          backLabel="The office"
          note="Add a person, reset a code, tap a row for their room. That is the whole screen."
        />
        <StepNote step={10} text="Tap a teacher's row to change their room, then try Add a person." />

        <h2 className="text-2xl">Your team</h2>
        <Card className="mt-3">
          {mounted ? (
            <ul className="divide-y" style={{ borderColor: "var(--pv-line)" }}>
              {staff.map((person) => (
                <li key={person.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleRow(person.id)}
                      aria-expanded={openStaffId === person.id}
                      className="pv-press pv-target flex flex-1 items-center gap-3 rounded-xl text-left"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl"
                        style={{ backgroundColor: "#f4f0e9" }}
                      >
                        {person.avatar}
                      </span>
                      <span>
                        <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
                          {person.firstName} {person.lastName}
                        </span>
                        <span className="block text-base" style={{ color: "var(--pv-muted)" }}>
                          {staffSub(person)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={resetCode}
                      className="pv-press pv-target shrink-0 rounded-xl px-3 py-2 text-base font-bold"
                      style={{ color: "var(--pv-sky)" }}
                    >
                      Reset code
                    </button>
                  </div>
                  {openStaffId === person.id ? (
                    <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: "#f4f0e9" }}>
                      <p className="text-base font-bold" style={{ color: "var(--pv-ink)" }}>
                        Their room
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {ROOMS.map((room) => (
                          <Chip
                            key={room.id}
                            label={`${room.emoji} ${room.name}`}
                            on={person.roomId === room.id}
                            onColor={room.color}
                            onClick={() => setStaffRoom(person.id, room.id)}
                          />
                        ))}
                        <Chip
                          label="Floats"
                          on={person.roomId === null}
                          onClick={() => setStaffRoom(person.id, null)}
                        />
                      </div>
                      <p className="mt-3 text-sm" style={{ color: "var(--pv-muted)" }}>
                        This is the one deeper thing. Everything else lives in Josh&apos;s layer.
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <h2 className="mt-8 text-2xl">Families</h2>
        <Card className="mt-3">
          {mounted ? (
            <ul className="divide-y" style={{ borderColor: "var(--pv-line)" }}>
              {families.map((family) => (
                <li key={family.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl"
                    style={{ backgroundColor: "#f4f0e9" }}
                  >
                    {family.avatar}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
                      {family.name}
                    </span>
                    <span className="block text-base" style={{ color: "var(--pv-muted)" }}>
                      {family.kidIds.length === 1 ? "1 kid" : `${family.kidIds.length} kids`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={resetCode}
                    className="pv-press pv-target shrink-0 rounded-xl px-3 py-2 text-base font-bold"
                    style={{ color: "var(--pv-sky)" }}
                  >
                    Reset code
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        {adding ? (
          <Card className="mt-8">
            <h2 className="text-2xl">Add a person</h2>
            <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
              Who are they?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip label="Staff" on={newKind === "staff"} onClick={() => setNewKind("staff")} />
              <Chip label="Family" on={newKind === "family"} onClick={() => setNewKind("family")} />
            </div>
            <label htmlFor="new-person-name" className="mt-5 block text-base font-bold" style={{ color: "var(--pv-ink)" }}>
              Their name
            </label>
            <input
              id="new-person-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={newKind === "staff" ? "First and last name" : "Family name"}
              className="pv-target mt-2 w-full rounded-xl border-2 px-4 py-3 text-lg"
              style={{
                borderColor: "var(--pv-line)",
                backgroundColor: "var(--pv-card)",
                color: "var(--pv-ink)",
              }}
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BigButton
                emoji="✅"
                label="Add them"
                color="var(--pv-teal)"
                disabled={!newName.trim()}
                onClick={() => {
                  addPerson({ kind: newKind, name: newName });
                  closeForm();
                  setSuccess("Added. They get their code the first time they visit the front desk.");
                }}
              />
              <BigButton label="Cancel" color="var(--pv-muted)" onClick={closeForm} />
            </div>
          </Card>
        ) : (
          <div className="mt-8">
            <BigButton
              kiosk
              emoji="＋"
              label="Add a person"
              color="var(--pv-teal)"
              className="w-full"
              onClick={() => setAdding(true)}
            />
          </div>
        )}

        <p className="mt-8 text-center text-base" style={{ color: "var(--pv-muted)" }}>
          Reports, paperwork, and the deeper settings are Josh&apos;s layer. You never have to see them.
        </p>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
