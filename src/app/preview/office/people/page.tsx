"use client";

// People, three verbs only (design exploration section 07).
// Add a person, reset a code, tap a row for their room. That is the
// whole screen. Reports and deeper settings live in Josh's layer.

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import {
  BigButton,
  Card,
  Chip,
  ScreenHeader,
  StepNote,
  SuccessBanner,
  useMounted,
} from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import type { PreviewRoom, PreviewStaff } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

function staffSub(person: PreviewStaff, rooms: PreviewRoom[]): string {
  if (person.role === "owner") return "Owner";
  const room = person.roomId ? rooms.find((r) => r.id === person.roomId) ?? null : null;
  return room ? `Teacher, ${room.name}` : "Teacher, floats between rooms";
}

export default function PeoplePage() {
  const mounted = useMounted();
  const rooms = usePreviewStore((s) => s.rooms);
  const staff = usePreviewStore((s) => s.staff);
  const families = usePreviewStore((s) => s.families);
  const setStaffRoom = usePreviewStore((s) => s.setStaffRoom);
  const addPerson = usePreviewStore((s) => s.addPerson);
  const staffPhotos = usePreviewStore((s) => s.staffPhotos);
  const setStaffPhoto = usePreviewStore((s) => s.setStaffPhoto);

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
          backHref="/preview/office"
          backLabel="The office"
          note="Add a person, reset a code, tap a row for their room. That is the whole screen."
        />
        <StepNote step={10} text="Tap a teacher's row to change their room, then try Add a person." />

        <div className="pv-rise" style={{ animationDelay: "60ms" }}>
        <h2 className="pv-tad-title mt-1 text-2xl">your team</h2>
        <Card className="mt-3">
          {mounted ? (
            <ul className="divide-y" style={{ borderColor: "var(--pv-line)" }}>
              {staff.map((person) => (
                <li key={person.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="relative shrink-0">
                      <PhotoAvatar
                        id={person.id}
                        name={`${person.firstName} ${person.lastName}`}
                        src={staffPhotos[person.id]}
                        size={44}
                        rounded="rounded-md"
                      />
                      <AvatarUpload
                        label={`Upload a photo for ${person.firstName}`}
                        onPhoto={(d) => setStaffPhoto(person.id, d)}
                        className="absolute -bottom-1 -right-1"
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRow(person.id)}
                      aria-expanded={openStaffId === person.id}
                      className="pv-press pv-target flex flex-1 items-center gap-3 rounded-lg text-left"
                    >
                      <span>
                        <span className="block text-lg font-bold" style={{ color: "var(--pv-ink)" }}>
                          {person.firstName} {person.lastName}
                        </span>
                        <span className="block text-base" style={{ color: "var(--pv-muted)" }}>
                          {staffSub(person, rooms)}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={resetCode}
                      className="pv-press pv-target shrink-0 rounded-lg px-3 py-2 text-base font-bold"
                      style={{ color: "var(--pv-sky)" }}
                    >
                      Reset code
                    </button>
                  </div>
                  {openStaffId === person.id ? (
                    <div className="mt-3 rounded-lg border p-4" style={{ backgroundColor: "#faf8f4", borderColor: "var(--pv-line)" }}>
                      <p className="pv-tad-label text-base">their room</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rooms.map((room) => (
                          <Chip
                            key={room.id}
                            label={room.name}
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
        </div>

        <div className="pv-rise" style={{ animationDelay: "120ms" }}>
        <h2 className="pv-tad-title mt-8 text-2xl">families</h2>
        <Card className="mt-3">
          {mounted ? (
            <ul className="divide-y" style={{ borderColor: "var(--pv-line)" }}>
              {families.map((family) => (
                <li key={family.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <PhotoAvatar
                    id={family.id}
                    name={family.name}
                    size={44}
                    rounded="rounded-md"
                    className="shrink-0"
                  />
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
                    className="pv-press pv-target shrink-0 rounded-lg px-3 py-2 text-base font-bold"
                    style={{ color: "var(--pv-sky)" }}
                  >
                    Reset code
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
        </div>

        <div className="pv-rise" style={{ animationDelay: "180ms" }}>
        {adding ? (
          <Card className="mt-8">
            <h2 className="pv-tad-title text-2xl">add a person</h2>
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
              className="pv-target mt-2 w-full rounded-lg border-2 px-4 py-3 text-lg"
              style={{
                borderColor: "var(--pv-line)",
                backgroundColor: "var(--pv-card)",
                color: "var(--pv-ink)",
              }}
            />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BigButton
                icon={Check}
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
              icon={Plus}
              label="Add a person"
              color="var(--pv-coral)"
              className="w-full"
              onClick={() => setAdding(true)}
            />
          </div>
        )}
        </div>

        <p className="mt-8 text-center text-base" style={{ color: "var(--pv-muted)" }}>
          Reports, paperwork, and the deeper settings are Josh&apos;s layer. You never have to see them.
        </p>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
