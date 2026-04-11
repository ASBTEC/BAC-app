import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getItem, setItem } from '@/utils/storage';

const STORAGE_KEY = 'bac_saved_event_ids';

interface ScheduleContextValue {
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  addEvent: (id: string) => void;
  removeEvent: (id: string) => void;
  toggleEvent: (id: string) => void;
  loaded: boolean;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed: string[] = JSON.parse(raw);
          setSavedIds(new Set(parsed));
        } catch {
          // ignore corrupt storage
        }
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
  }, []);

  const addEvent = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeEvent = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const toggleEvent = useCallback(
    (id: string) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return (
    <ScheduleContext.Provider value={{ savedIds, isSaved, addEvent, removeEvent, toggleEvent, loaded }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useScheduleContext(): ScheduleContextValue {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useScheduleContext must be used inside ScheduleProvider');
  return ctx;
}
