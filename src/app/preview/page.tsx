import { redirect } from 'next/navigation';

// The old preview/demo walkthrough index (with sample PINs and "nothing here is
// real" copy) is retired for production. The portal entry is /start: choose a
// center, then sign in. Hitting /preview now goes straight there.
export default function PreviewIndex() {
  redirect('/start');
}
