import { useCallback, useEffect, useState } from 'react';
import { getItem, setItem } from '@/utils/storage';

const STORAGE_KEY = 'bac_saved_event_ids';

export function useSchedule() {
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

  return { savedIds, isSaved, addEvent, removeEvent, toggleEvent, loaded };
}
