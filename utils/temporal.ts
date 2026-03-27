import { Event, TemporalStatus } from '@/types';

export function getTemporalStatus(event: Event, now: Date = new Date()): TemporalStatus {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const nowMs = now.getTime();

  if (nowMs >= start.getTime() && nowMs <= end.getTime()) return 'now';
  if (nowMs > end.getTime()) return 'past';
  // upcoming = starts within 30 min
  if (start.getTime() - nowMs <= 30 * 60 * 1000) return 'upcoming';
  return 'future';
}

export function formatTimeSlot(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Sort by time proximity: NOW first, then UPCOMING, then FUTURE by start time, then PAST last */
export function sortByProximity(events: Event[], now: Date = new Date()): Event[] {
  return [...events].sort((a, b) => {
    const sa = new Date(a.start_time).getTime();
    const ea = new Date(a.end_time).getTime();
    const sb = new Date(b.start_time).getTime();
    const eb = new Date(b.end_time).getTime();
    const nowMs = now.getTime();

    const isNowA = nowMs >= sa && nowMs <= ea;
    const isNowB = nowMs >= sb && nowMs <= eb;
    const isPastA = nowMs > ea;
    const isPastB = nowMs > eb;

    if (isNowA && !isNowB) return -1;
    if (!isNowA && isNowB) return 1;
    if (!isPastA && isPastB) return -1;
    if (isPastA && !isPastB) return 1;
    return sa - sb;
  });
}
