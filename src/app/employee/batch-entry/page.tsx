import { redirect } from 'next/navigation';

// Superseded by the new room log (/preview/room), which does any-room logging
// for everyone. Redirect so the old design is never shown.
export default function BatchEntryRedirect() {
  redirect('/preview/room');
}
