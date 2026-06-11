"use client";

// One-screen week schedule (design exploration section 06, Homebase pattern).
// People as rows, days as columns. Tap a pill to edit it, tap an empty day
// to add a shift. Copy last week and Publish are the explicit-publish
// pattern: the two big buttons only announce what happened, nothing goes
// out by accident.

import { useState } from "react";
import { BigButton, Card, Chip, ScreenHeader, StepNote, SuccessBanner, useMounted } from "@/components/preview/ui";
import { DAY_LABELS, ROOMS, roomById } from "@/lib/preview/fixtures";
import { usePreviewStore } from "@/lib/preview/store";
import { playClick } from "@/lib/preview/sound";

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
          title="The week"
          emoji="📅"
          note="People as rows, days as columns. Most weeks are the same week."
        />
        <StepNote step={7} text="Tap a colored shift to change it, or tap + Add on an empty day." />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <BigButton
            emoji="⟳"
            label="Copy last week"
            color="var(--pv-teal)"
            onClick={() => setSuccess("Last week is copied in. Adjust anything, then publish.")}
          />
          <BigButton
            emoji="📣"
            label="Publish"
            color="var(--pv-coral)"
            onClick={() => setSuccess("Published. Your team will see their week.")}
          />
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="text-left">
                    <span className="sr-only">Person</span>
                  </th>
                  {DAY_LABELS.map((day) => (
                    <th key={day} className="min-w-[104px] pb-1 text-base font-extrabold" style={{ color: "var(--pv-ink)" }}>
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
                        <span aria-hidden="true" className="text-2xl">{member.avatar}</span>
                        <span className="text-base font-extrabold">{member.firstName}</span>
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
                                      className="pv-press pv-target w-full rounded-lg px-2 py-2 text-center font-bold text-white"
                                      style={{ backgroundColor: room ? room.color : "var(--pv-gold)" }}
                                      aria-label={`${member.firstName}, ${day}, ${shift.start} to ${shift.end} in ${room ? room.name : "the office"}. Tap to change.`}
                                    >
                                      <span className="block text-base">{shift.start}-{shift.end}</span>
                                      <span className="block text-sm font-semibold opacity-90">
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

        {editor && editorStaff ? (
          <Card className="mt-5">
            <h2 className="text-2xl">
              <span aria-hidden="true" className="mr-2">{editorStaff.avatar}</span>
              {editorStaff.firstName} on {DAY_LABELS[editor.day]}
            </h2>
            <p className="mt-1 text-base" style={{ color: "var(--pv-muted)" }}>
              {editor.shiftId
                ? "Change the hours or the room, or remove the shift."
                : "Pick the hours and the room, then save."}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shift-start" className="mb-1 block text-base font-bold">
                  Starts
                </label>
                <select
                  id="shift-start"
                  value={editor.start}
                  onChange={(e) => setEditor({ ...editor, start: e.target.value })}
                  className="pv-target h-12 w-full rounded-xl border-2 px-3 text-lg font-semibold"
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
                <label htmlFor="shift-end" className="mb-1 block text-base font-bold">
                  Ends
                </label>
                <select
                  id="shift-end"
                  value={editor.end}
                  onChange={(e) => setEditor({ ...editor, end: e.target.value })}
                  className="pv-target h-12 w-full rounded-xl border-2 px-3 text-lg font-semibold"
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

            <p className="mt-4 mb-1 text-base font-bold">Room</p>
            <div className="flex flex-wrap gap-3">
              {ROOMS.map((room) => (
                <Chip
                  key={room.id}
                  label={`${room.emoji} ${room.name}`}
                  on={editor.roomId === room.id}
                  onClick={() => setEditor({ ...editor, roomId: room.id })}
                  onColor={room.color}
                />
              ))}
              <Chip
                label="🗂️ Office"
                on={editor.roomId === null}
                onClick={() => setEditor({ ...editor, roomId: null })}
                onColor="var(--pv-gold)"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BigButton emoji="✅" label="Save shift" color="var(--pv-teal)" onClick={saveShift} />
              {editor.shiftId ? (
                <BigButton emoji="🗑️" label="Remove shift" color="var(--pv-plum)" onClick={removeCurrentShift} />
              ) : null}
              <BigButton emoji="↩️" label="Cancel" color="#8a8378" onClick={() => setEditor(null)} />
            </div>
          </Card>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {ROOMS.map((room) => (
            <span key={room.id} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-4 w-4 rounded" style={{ backgroundColor: room.color }} />
              <span className="text-sm font-bold">{room.name}</span>
            </span>
          ))}
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-4 w-4 rounded" style={{ backgroundColor: "var(--pv-gold)" }} />
            <span className="text-sm font-bold">Office</span>
          </span>
        </div>
      </div>

      {success ? <SuccessBanner message={success} onDone={() => setSuccess(null)} /> : null}
    </main>
  );
}
