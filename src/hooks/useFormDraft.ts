'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const DRAFT_PREFIX = 'draft_';
const DEBOUNCE_MS = 500;

/**
 * Persists form state to localStorage while the user types.
 * On mount, restores any previously saved draft for the given key.
 *
 * @param key - Unique identifier for this form. Stored as `draft_${key}`.
 * @param initialValues - The default form values used when no draft exists.
 * @returns [values, setValues, clearDraft]
 */
export function useFormDraft<T>(
  key: string,
  initialValues: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const storageKey = `${DRAFT_PREFIX}${key}`;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Attempt to load a previously saved draft on first render.
  // Falls back to initialValues if nothing is stored or parsing fails.
  const [values, setValuesRaw] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValues;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return initialValues;
      return JSON.parse(raw) as T;
    } catch {
      return initialValues;
    }
  });

  // Debounced save to localStorage whenever values change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch (err) {
        console.error(`useFormDraft: failed to save draft for key "${key}"`, err);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [values, storageKey, key]);

  // Removes the saved draft and resets values to initialValues
  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Non-fatal if removal fails
      }
    }
    setValuesRaw(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return [values, setValuesRaw, clearDraft];
}
