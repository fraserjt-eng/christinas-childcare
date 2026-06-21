import { redirect } from 'next/navigation';

// The old cartoony daily-report page is superseded by the new room log
// (/preview/room), which has the same logging plus bottles, diapers, photos,
// naps, and any-room editing. Redirect so no one lands on the old design.
export default function DailyReportRedirect() {
  redirect('/preview/room');
}
