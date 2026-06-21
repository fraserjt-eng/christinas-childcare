import { redirect } from 'next/navigation';

// Superseded by the new food counts screen (/preview/meals). Redirect so the
// old design is never shown.
export default function MealCountRedirect() {
  redirect('/preview/meals');
}
