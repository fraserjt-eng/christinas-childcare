"use client";

// One-screen week schedule (design exploration section 06, Homebase pattern).
// People as rows, days as columns. Tap a pill to edit it, tap an empty day
// to add a shift. Copy last week and Publish are the explicit-publish
// pattern: the two big buttons only announce what happened, nothing goes
// out by accident.

import { useState } from "react";
import {
  Backpack,
  Baby,
  Blocks,
  Briefcase,
  Check,
  Copy,
  Palette,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { BigButton, Card, Chip, ScreenHeader, StepNote, SuccessBanner, useMounted } from "@/components/preview/ui";
import { PhotoAvatar } from "@/components/preview/PhotoAvatar";
import { AvatarUpload } from "@/components/preview/AvatarUpload";
import { DAY_LABELS, ROOMS, roomById } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

// Small line icons for each room, tinted with the room color (Tadpoles look).
const ROOM_ICON: Record<string, LucideIcon> = {
  infants: Baby,
  toddlers: Blocks,
  preschool: Palette,
  schoolage: Backpack,
};

interface ShiftEditor {
  staffId: string;
  day: number;
  shiftId: string | null;
  start: string;
  end: string;
  roomId: string | null;
}

// Plain display strings, same shape the seed shifts use. "6:00" covers
// the early open and the evening close in this demo.
const TIME_OPTIONS = [
  "6:00",
  "7:00",
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "1:00",
  "2:00",
  "3:00",
  "4:00",
  "5:00",
];

export default function SchedulePage() {
  const mounted = useMounted();
  const staff = usePreviewStore((s) => s.staff);
  const shifts = usePreviewStore((s) => s.shifts);
  const staffPhotos = usePreviewStore((s) => s.staffPhotos);
  const setStaffPhoto = usePreviewStore((s) => s.setStaffPhoto);
  const addShift = usePreviewStore((s) => s.addShift);
  const updateShift = usePreviewStore((s) => s.updateShift);
  const removeShift = usePreviewStore((s) => s.removeShift);

  const [editor, setEditor] = useState<ShiftEditor | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const editorStaff = editor ? staff.find((s) => s.id === editor.staffId) ?? null : null;

  function openAdd(staffId: string, day: number) {
    const member = staff.find((s) => s.id === staffId);
    setEditor({
      staffId,
      day,
      shiftId: null,
      start: "8:00",
      end: "4:00",
      roomId: member ? member.roomId : null,
    });
  }

  function saveShift() {
    if (!editor) return;
    if (editor.shiftId) {
      updateShift(editor.shiftId, {
        start: editor.start,
        end: editor.end,
        roomId: editor.roomId,
      });
    } else {
      addShift({
        staffId: editor.staffId,
        day: editor.day,
        start: editor.start,
        end: editor.end,
        roomId: editor.roomId,
      });
    }
    setEditor(null);
    setSuccess("Saved. The grid is up to date.");
  }

  function removeCurrentShift() {
    if (!editor || !editor.shiftId) return;
    removeShift(editor.shiftId);
    setEditor(null);
    setSuccess("Saved. The grid is up to date.");
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <ScreenHeader
          title="the week"
          note="People as rows, days as columns. Most weeks are the same week."
        />
        <StepNote step={7} text="Tap a colored shift to change it, or tap + Add on an empty day." />

        <div className="pv-rise mb-5 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "60ms" }}>
          <BigButton
            icon={Copy}
            label="Copy last week"
            color="var(--pv-teal)"
            onClick={() => setSuccess("Last week is copied in. Adjust anything, then publish.")}
          />
          <BigButton
            icon={Send}
            label="Publish"
            color="var(--pv-coral)"
            onClick={() => setSuccess("Published. Your team will see their week.")}
          />
        </div>

        <div className="pv-rise" style={{ animationDelay: "120ms" }}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="text-left">
                    <span className="sr-only">Person</span>
                  </th>
                  {DAY_LABELS.map((day) => (
                    <th key={day} className="min-w-[104px] pb-1 text-sm font-semibold lowercase" style={{ color: "var(--pv-muted)" }}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <th scope="row" className="pr-2 text-left align-top">
                      <span className="flex items-center gap-2 whitespace-nowrap pt-2">
                        <span className="relative flex-shrink-0">
                          <PhotoAvatar
                            id={member.id}
                            name={`${member.firstName} ${member.lastName}`}
                            src={staffPhotos[member.id]}
                            size={36}
                            rounded="rounded-md"
                          />
                          <AvatarUpload
                            label={`Upload a photo for ${member.firstName}`}
                            onPhoto={(d) => setStaffPhoto(member.id, d)}
                            className="absolute -bottom-1 -right-1"
                          />
                        </span>
                        <span className="text-base font-semibold" style={{ color: "var(--pv-ink)" }}>{member.firstName}</span>
                      </span>
                    </th>
                    {DAY_LABELS.map((day, dayIndex) => {
                      const dayShifts = shifts.filter(
                        (shift) => shift.staffId === member.id && shift.day === dayIndex,
                      );
                      return (
                        <td key={day} className="align-top">
                          {mounted ? (
                            dayShifts.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {dayShifts.map((shift) => {
                                  const room = shift.roomId ? roomById(shift.roomId) : null;
                                  const accent = room ? room.color : "var(--pv-gold)";
                                  const ShiftIcon = room ? ROOM_ICON[room.id] ?? Baby : Briefcase;
                                  return (
                                    <button
                                      key={shift.id}
                                      type="button"
                                      onClick={() => {
                                        playClick();
                                        setEditor({
                                          staffId: shift.staffId,
                                          day: shift.day,
                                          shiftId: shift.id,
                                          start: shift.start,
                                          end: shift.end,
                                          roomId: shift.roomId,
                                        });
                                      }}
                                      className="pv-lift pv-target w-full rounded-md border bg-white py-2 pl-3 pr-2 text-left shadow-sm"
                                      style={{ borderColor: "var(--pv-line)", borderLeft: `3px solid ${accent}` }}
                                      aria-label={`${member.firstName}, ${day}, ${shift.start} to ${shift.end} in ${room ? room.name : "the office"}. Tap to change.`}
                                    >
                                      <span className="block text-base font-bold" style={{ color: "var(--pv-ink)" }}>
                                        {shift.start}-{shift.end}
                                      </span>
                                      <span className="mt-0.5 flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>
                                        <ShiftIcon size={13} aria-hidden="true" className="flex-shrink-0" />
                                        {room ? room.name : "Office"}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  playClick();
                                  openAdd(member.id, dayIndex);
                                }}
                                className="pv-press pv-target w-full rounded-lg border-2 border-dashed px-2 py-3 text-base font-bold"
                                style={{ borderColor: "var(--pv-line)", color: "var(--pv-muted)" }}
                                aria-label={`Add a shift for ${member.firstName} on ${day}`}
                              >
                                + Add
                              </button>
                            )
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </div>

        {editor && editorStaff ? (
          <Card className="pv-rise mt-5">
            <h2 className="pv-tad-title flex items-center gap-2 text-2xl">
              <PhotoAvatar
                id={editorStaff.id}
                name={`${editorStaff.firstName} ${editorStaff.lastName}`}
                src={staffPhotos[editorStaff.id]}
                size={40}
                rounded="rounded-md"
              />
              <span>{editorStaff.firstName} on {DAY_LABELS[editor.day]}</span>
            </h2>
            <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
              {editor.shiftId
                ? "Change the hours or the room, or remove the shift."
                : "Pick the hours and the room, then save."}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shift-start" className="mb-1 block text-sm font-semibold lowercase" style={{ color: "var(--pv-muted)" }}>
                  starts
                </label>
                <select
                  id="shift-start"
                  value={editor.start}
                  onChange={(e) => {
                    playClick();
                    setEditor({ ...editor, start: e.target.value });
                  }}
                  className="pv-target h-12 w-full rounded-md border px-3 text-lg font-semibold"
                  style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)", color: "var(--pv-ink)" }}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="shift-end" className="mb-1 block text-sm font-semibold lowercase" style={{ color: "var(--pv-muted)" }}>
                  ends
                </label>
                <select
                  id="shift-end"
                  value={editor.end}
                  onChange={(e) => {
                    playClick();
                    setEditor({ ...editor, end: e.target.value });
                  }}
                  className="pv-target h-12 w-full rounded-md border px-3 text-lg font-semibold"
                  style={{ borderColor: "var(--pv-line)", backgroundColor: "var(--pv-card)", color: "var(--pv-ink)" }}
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mb-1 mt-4 text-sm font-semibold lowercase" style={{ color: "var(--pv-muted)" }}>room</p>
            <div className="flex flex-wrap gap-3">
              {ROOMS.map((room) => (
                <Chip
                  key={room.id}
                  label={room.name}
                  on={editor.roomId === room.id}
                  onClick={() => setEditor({ ...editor, roomId: room.id })}
                  onColor={room.color}
                />
              ))}
              <Chip
                label="Office"
                on={editor.roomId === null}
                onClick={() => setEditor({ ...editor, roomId: null })}
                onColor="var(--pv-gold)"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BigButton icon={Check} label="Save shift" color="var(--pv-teal)" onClick={saveShift} />
              {editor.shiftId ? (
                <BigButton icon={Trash2} label="Remove shift" color="var(--pv-plum)" onClick={removeCurrentShift} />
              ) : null}
              <BigButton icon={X} label="Cancel" color="#8a8378" onClick={() => setEditor(null)} />
            </div>
          </Card>
        ) : null}

        <div className="pv-rise mt-5 flex flex-wrap items-center gap-x-5 gap-y-2" style={{ animationDelay: "180ms" }}>
          {ROOMS.map((room) => {
            const RoomIcon = ROOM_ICON[room.id] ?? Baby;
            return (
              <span key={room.id} className="flex items-center gap-1.5">
                <RoomIcon size={14} style={{ color: room.color }} />
                <span className="text-sm font-semibold" style={{ color: "var(--pv-ink)" }}>{room.name}</span>
              </span>
            );
          })}
          <span className="flex items-center gap-1.5">
            <Briefcase size={14} style={{ color: "var(--pv-gold)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--pv-ink)" }}>Office</span>
          </span>
        </div>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
