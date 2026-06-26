// Curated how-to / capabilities digest for the leadership Coach. This is the
// ground truth the Coach answers from — hand-maintained (not the full 30
// training modules) so answers stay accurate and the prompt stays small. When
// a feature changes, update the relevant line here.

export const COACH_KNOWLEDGE = `
# Christina's Child Care app — what it does and how

## Sign in & who can do what
- Staff sign in with a 4-8 digit PIN on the kiosk or the staff sign-in. Parents sign in with their family PIN. Owners (Dr. J Fraser, Christina, Ophelia, Stephen) can sign in by PIN or Google and have full cross-center "superadmin" access.
- Owners can switch between Brooklyn Park, Crystal, and a Combined view using the center switcher in the top bar / sidebar of the admin back office. If you don't see it, sign out and back in once.
- Two surfaces: the "office" front screen (the simple owner landing at /preview/office) and the deep back office (/admin). The Admin button opens the deep one.

## Attendance & the kiosk
- Families check in/out at the kiosk by tapping their PIN, then tapping the child and the adult dropping off/picking up.
- Staff can also enter attendance: Attendance page has "Today (live)" and "Enter a day" (a bulk grid to key a paper sign-in sheet for any date).
- The Attendance Hub shows by-room and by-day totals and exports the DCYF "Import Attendance" CSV.
- Time corrections: an admin can fix or delete a check-in/out on the attendance page.

## Daily reports (the room log + the parent report)
- Staff log a child's day from the room screen: tap an action (Meal, Nap, Activity, Photo, Note, and for infants Bottle + Diaper). Toddler rooms also get Potty (toileting) and Accident.
- Each entry shows up on the parent's Daily Report as a time-stamped timeline (earliest first).
- The live "today" feed shows only today. To see a past day, open Daily Reports (office tile or Admin > Daily Reports) and use the day arrows; parents use Daily Report in their portal. Nothing is deleted — every past day stays viewable.

## Photos
- A child's profile photo is taken with the small camera button on their tile; it uploads to the cloud and shows on every device (no longer device-only). Activity photos logged in the room show on the parent report and in Photo Review.

## Families & PINs
- Manage families in Admin > Families (add/edit a family, children, contacts, status). The PIN Roster prints family + staff PINs.

## Communications
- Newsletters: the office Newsletter tile opens the full builder with AI draft + auto-fill, audience (parent/staff), sections, preview, and send.
- Parent messages: a message to a family is saved as a DRAFT and an owner approves it (Review & Send) before it reaches the parent. Approve sends it to the parent portal (and emails them when email is turned on).

## Billing
- Billing (rates -> charges -> statements -> balances) is being built and is owner-only. Tell families it's coming if asked. (If a feature here isn't live yet, offer to create a ticket.)

## Support
- Anyone can report an issue with the "Report an Issue" button; it reaches Dr. J Fraser. The Coach can create one of these tickets when the app can't do what's being asked.
`.trim();
