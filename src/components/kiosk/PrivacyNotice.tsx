'use client';

// Full-screen kiosk privacy-notice gate (MN DCYF). Shown after a family is
// identified and BEFORE any check-in, on first use on/after 2026-06-22, then
// yearly and whenever PRIVACY_NOTICE_VERSION changes. The parent must read and
// agree to continue; declining routes them to staff. The text below is the
// verbatim DCYF Parent/Guardian Kiosk Privacy Notice.

import { useState } from 'react';

// Verbatim DCYF privacy-notice content, kept as data so it renders cleanly and
// is easy to update (bump PRIVACY_NOTICE_VERSION in src/lib/attestation.ts when
// the wording changes).
const NOTICE: { heading: string; body: string }[] = [
  {
    heading: 'Why do you need an account?',
    body: 'To access the Parent Experience Kiosk, your child care program will create an account for you and ensure that you receive a PIN via email. The purpose of this account is to provide you with the ability to sign your child/ren in and out of their childcare program to document their attendance. As a part of creating an account, you are also agreeing to not share your PIN with other adults, including your provider.',
  },
  {
    heading: 'To take attendance, you will be asked to provide information.',
    body: 'Requested information includes child first name, child last name, check-in date and time, and check-out date and time. This information is considered private data under Minnesota law.',
  },
  {
    heading: 'Why am I being asked for this information?',
    body: "Your child's attendance information is required because: your child participates in the Child Care Assistance Program, the Program receives certain state funding, or the information is necessary for the Program to meet licensing requirements.",
  },
  {
    heading: 'Am I required to provide this data?',
    body: "You are not legally required to take your children's attendance through this Kiosk. If you choose not to document your children's attendance through this Kiosk, your Program will still provide your child/ren's attendance information to the State of Minnesota because it is required as condition of payment or is otherwise necessary for the State of Minnesota to review the Program's compliance with licensing standards.",
  },
  {
    heading: 'Who may see this information?',
    body: "Your child's attendance information will be shared with your child care program and with staff at the State of Minnesota whose jobs require reasonable access to your information to support program administration and compliance. This data may also be shared with anyone else to whom the law says we must or can give the information. Data may be shared upon court order or provided to the state or legislative auditor.",
  },
];

export function PrivacyNotice({
  familyName,
  onAgree,
  onDecline,
}: {
  familyName: string;
  onAgree: () => void | Promise<void>;
  onDecline: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function agree() {
    if (!checked || busy) return;
    setBusy(true);
    try {
      await onAgree();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf6f0]">
      {/* Brand header */}
      <div className="bg-christina-red text-white px-6 py-5 flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-christina-red text-3xl font-extrabold">
          C
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold leading-tight">Privacy Notice</div>
          <div className="text-base opacity-90 leading-tight">
            Please read before checking in, {familyName} family
          </div>
        </div>
      </div>

      {/* Scrollable notice body */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-5">
          {NOTICE.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-bold text-gray-900">{s.heading}</h2>
              <p className="mt-1 text-base leading-relaxed text-gray-700">{s.body}</p>
            </div>
          ))}
          <p className="text-base font-semibold text-gray-900">
            By agreeing, I acknowledge and confirm that I have read, understand, and
            accept the terms and conditions stated above.
          </p>
        </div>
      </div>

      {/* Agreement + actions (sticky footer) */}
      <div className="border-t-2 border-christina-red/15 bg-white px-6 py-5">
        <div className="mx-auto max-w-2xl">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-6 w-6 flex-shrink-0 accent-christina-red"
            />
            <span className="text-base font-semibold text-gray-900">
              I have read, understand, and accept the privacy notice above.
            </span>
          </label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={agree}
              disabled={!checked || busy}
              className="w-full rounded-2xl bg-christina-red py-4 text-xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 sm:flex-1"
            >
              {busy ? 'Saving...' : 'Agree & Continue'}
            </button>
            <button
              type="button"
              onClick={onDecline}
              disabled={busy}
              className="w-full rounded-2xl bg-gray-100 py-4 text-xl font-bold text-gray-600 transition-all active:scale-[0.98] disabled:opacity-40 sm:flex-1"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// The "declined / not yet agreed" screen: a parent who does not agree cannot use
// the kiosk; staff records attendance manually.
export function SeeStaffScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf6f0] px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-christina-red text-4xl font-extrabold text-white">
        C
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Please see staff</h1>
      <p className="mt-3 max-w-md text-lg text-gray-600">
        To check your child in or out at the kiosk, the privacy notice must be
        accepted. A staff member can record attendance for you, or you can review
        and accept the notice anytime.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-8 rounded-2xl bg-christina-red px-8 py-4 text-xl font-bold text-white active:scale-[0.98]"
      >
        Back to start
      </button>
    </div>
  );
}
