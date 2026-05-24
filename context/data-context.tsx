import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import bundledEvents from '@/data/events.json';
import bundledExhibitors from '@/data/exhibitors.json';
import { Event, Exhibitor } from '@/types';

const EVENTS_URL = 'https://raw.githubusercontent.com/ASBTEC/BAC-app/master/data/events.json';
const EXHIBITORS_URL = 'https://raw.githubusercontent.com/ASBTEC/BAC-app/master/data/exhibitors.json';
const STORAGE_KEY_EVENTS = '@bac_events';
const STORAGE_KEY_EXHIBITORS = '@bac_exhibitors';

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
          if (isValidEvents(parsed)) setEvents(parsed);
        }
        if (cachedExhibitors) {
          const parsed = JSON.parse(cachedExhibitors);
          if (isValidExhibitors(parsed)) setExhibitors(parsed);
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
          setEvents(eventsJson);
          AsyncStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(eventsJson)).catch(() => {});
        }
        if (isValidExhibitors(exhibitorsJson)) {
          setExhibitors(exhibitorsJson);
          AsyncStorage.setItem(STORAGE_KEY_EXHIBITORS, JSON.stringify(exhibitorsJson)).catch(() => {});
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
