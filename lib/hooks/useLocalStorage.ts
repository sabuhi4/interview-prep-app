'use client';

import { useSyncExternalStore, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);
  const cacheRef = useRef<{ raw: string | null; parsed: T } | null>(null);
  const eventName = `interview-prep-storage:${key}`;

  const subscribe = useCallback(
    (callback: () => void) => {
      window.addEventListener(eventName, callback);
      return () => window.removeEventListener(eventName, callback);
    },
    [eventName]
  );

  const getSnapshot = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      if (cacheRef.current && cacheRef.current.raw === raw) {
        return cacheRef.current.parsed;
      }
      const parsed = raw !== null ? (JSON.parse(raw) as T) : initialRef.current;
      cacheRef.current = { raw, parsed };
      return parsed;
    } catch {
      return initialRef.current;
    }
  }, [key]);

  const getServerSnapshot = useCallback((): T => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const current = getSnapshot();
      const resolved = typeof newValue === 'function' ? (newValue as (prev: T) => T)(current) : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
        cacheRef.current = null;
        window.dispatchEvent(new CustomEvent(eventName));
      } catch {
        // ignore
      }
    },
    [key, eventName, getSnapshot]
  );

  return [value, set] as const;
}
