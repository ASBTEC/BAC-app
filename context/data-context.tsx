import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import bundledEvents from '@/data/events.json';
import bundledExhibitors from '@/data/exhibitors.json';
import { Event, Exhibitor } from '@/types';

const EVENTS_URL = 'https://raw.githubusercontent.com/ASBTEC/BAC-app/master/data/events.json';
const EXHIBITORS_URL = 'https://raw.githubusercontent.com/ASBTEC/BAC-app/master/data/exhibitors.json';

// Bump this string whenever a breaking data change is deployed (e.g. ID remap).
// Any cached data stored under a different version is silently dropped.
const CACHE_VERSION = 'v2';
const STORAGE_KEY_EVENTS = `@bac_events_${CACHE_VERSION}`;
const STORAGE_KEY_EXHIBITORS = `@bac_exhibitors_${CACHE_VERSION}`;

interface DataContextValue {
  events: Event[];
  exhibitors: Exhibitor[];
}

const DataContext = createContext<DataContextValue>({
  events: bundledEvents as Event[],
  exhibitors: bundledExhibitors as Exhibitor[],
});

export function useData(): DataContextValue {
  return useContext(DataContext);
}

function isValidEvents(data: unknown): data is Event[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof (data[0] as any)?.id === 'string' &&
    typeof (data[0] as any)?.title === 'string'
  );
}

function isValidExhibitors(data: unknown): data is Exhibitor[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof (data[0] as any)?.id === 'string' &&
    typeof (data[0] as any)?.name === 'string'
  );
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>(bundledEvents as Event[]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>(bundledExhibitors as Exhibitor[]);

  useEffect(() => {
    async function syncData() {
      // Load last successfully downloaded data before fetching fresh data
      try {
        const [cachedEvents, cachedExhibitors] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_EVENTS),
          AsyncStorage.getItem(STORAGE_KEY_EXHIBITORS),
        ]);
        if (cachedEvents) {
          const parsed = JSON.parse(cachedEvents);
          if (isValidEvents(parsed)) setEvents(deduplicateById(parsed));
        }
        if (cachedExhibitors) {
          const parsed = JSON.parse(cachedExhibitors);
          if (isValidExhibitors(parsed)) setExhibitors(deduplicateById(parsed));
        }
      } catch {
        // ignore cache errors, bundled data remains active
      }

      // Fetch fresh data from GitHub in the background
      try {
        const [eventsRes, exhibitorsRes] = await Promise.all([
          fetch(EVENTS_URL),
          fetch(EXHIBITORS_URL),
        ]);
        const [eventsJson, exhibitorsJson] = await Promise.all([
          eventsRes.json(),
          exhibitorsRes.json(),
        ]);
        if (isValidEvents(eventsJson)) {
          const deduped = deduplicateById(eventsJson);
          setEvents(deduped);
          AsyncStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(deduped)).catch(() => {});
        }
        if (isValidExhibitors(exhibitorsJson)) {
          const deduped = deduplicateById(exhibitorsJson);
          setExhibitors(deduped);
          AsyncStorage.setItem(STORAGE_KEY_EXHIBITORS, JSON.stringify(deduped)).catch(() => {});
        }
      } catch {
        // fail silently — cached or bundled data remains active
      }
    }

    syncData();
  }, []);

  return (
    <DataContext.Provider value={{ events, exhibitors }}>
      {children}
    </DataContext.Provider>
  );
}
