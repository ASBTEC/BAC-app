import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { CategoryColors, BACColors, Colors, TrackColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Event } from '@/types';

// ─── Constants ──────────────────────────────────────────────────────────────

const CONGRESS_DAYS = [
  { date: '2026-07-07', label: 'Mar 7' },
  { date: '2026-07-08', label: 'Mié 8' },
  { date: '2026-07-09', label: 'Jue 9' },
  { date: '2026-07-10', label: 'Vie 10' },
] as const;

const START_HOUR = 8;
const END_HOUR = 24;
const HOUR_HEIGHT = 72;   // px per hour
const TIME_COL = 44;      // width of the left hour-label column
const COL_GAP = 3;        // gap between side-by-side overlapping blocks
const MIN_BLOCK_H = 36;   // minimum block height regardless of duration

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// ─── Types ──────────────────────────────────────────────────────────────────

interface LayoutItem {
  event: Event;
  top: number;
  height: number;
  col: number;
  numCols: number;
  colSpan: number;
}

export interface TimetableViewProps {
  events: Event[];
  now?: Date;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  /** Message shown when a day has no events in the grid */
  emptyMessage?: string;
  /** Optional content rendered above the day selector, scrolling together with the grid */
  header?: React.ReactNode;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Epoch ms for `dateStr` (YYYY-MM-DD) at `hourOffset` hours past midnight */
function dayMs(dateStr: string, hourOffset = 0): number {
  return new Date(dateStr + 'T00:00:00').getTime() + hourOffset * 3_600_000;
}

/** True if the event has any overlap with the given day */
function occursOnDay(event: Event, dateStr: string): boolean {
  return (
    new Date(event.start_time).getTime() < dayMs(dateStr, 24) &&
    new Date(event.end_time).getTime() > dayMs(dateStr, START_HOUR)
  );
}

/** True if the event spans more than one calendar day in a way visible in the timetable.
 *  Events that only cross midnight into the early morning (before START_HOUR) are treated
 *  as single-day timed blocks so they appear clipped to midnight on their start day. */
function isMultiDay(event: Event): boolean {
  const startDate = event.start_time.slice(0, 10);
  const endDate = event.end_time.slice(0, 10);
  if (startDate === endDate) return false;
  return new Date(event.end_time).getHours() >= START_HOUR;
}

// ─── Layout algorithm (greedy interval coloring) ────────────────────────────

// Events that overlap with ≥ this many other events are treated as "backdrop" events
// (e.g. all-day exhibition stands, open-room sessions spanning many parallel talks).
// Backdrops are placed in columns after all regular events so regular events can
// expand rightward and the backdrop appears as a narrow strip on the far right.
const BACKDROP_OVERLAP_COUNT = 6;

function layoutDayEvents(events: Event[], dateStr: string): LayoutItem[] {
  if (!events.length) return [];

  const items = events
    .map((event) => {
      const s = Math.max(
        new Date(event.start_time).getTime(),
        dayMs(dateStr, START_HOUR),
      );
      const e = Math.min(
        new Date(event.end_time).getTime(),
        dayMs(dateStr, END_HOUR),
      );
      const top = ((s - dayMs(dateStr, START_HOUR)) / 3_600_000) * HOUR_HEIGHT;
      const height = Math.max(MIN_BLOCK_H, ((e - s) / 3_600_000) * HOUR_HEIGHT);
      return { event, startMs: s, endMs: e, top, height };
    })
    .sort((a, b) => a.startMs - b.startMs);

  const isBackdrop = items.map((item, i) =>
    items.reduce((cnt, other, j) =>
      j !== i && other.startMs < item.endMs && other.endMs > item.startMs ? cnt + 1 : cnt, 0,
    ) >= BACKDROP_OVERLAP_COUNT,
  );

  // First pass: greedy column assignment for regular (non-backdrop) events
  const colEnds: number[] = [];
  const cols: number[] = new Array(items.length).fill(0);
  for (let i = 0; i < items.length; i++) {
    if (isBackdrop[i]) continue;
    let c = colEnds.findIndex((end) => end <= items[i].startMs);
    if (c === -1) c = colEnds.length;
    cols[i] = c;
    colEnds[c] = items[i].endMs;
  }

  // Second pass: greedy column assignment for backdrop events, placed in columns
  // after all regular events so they form a thin strip on the far-right side.
  const backdropOffset = colEnds.length; // = max regular col + 1 (0 if no regular events)
  const backdropColEnds: number[] = [];
  for (let i = 0; i < items.length; i++) {
    if (!isBackdrop[i]) continue;
    let c = backdropColEnds.findIndex((end) => end <= items[i].startMs);
    if (c === -1) c = backdropColEnds.length;
    cols[i] = backdropOffset + c;
    backdropColEnds[c] = items[i].endMs;
  }

  // Initial numCols: max column index among directly overlapping events + 1
  const numColsArr = items.map((item, i) => {
    let maxCol = cols[i];
    for (let j = 0; j < items.length; j++) {
      if (items[j].startMs < item.endMs && items[j].endMs > item.startMs) {
        maxCol = Math.max(maxCol, cols[j]);
      }
    }
    return maxCol + 1;
  });

  // Propagate: any two events that overlap in time must use the same numCols,
  // otherwise their different colW values cause blocks to render on top of each other.
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].startMs < items[j].endMs && items[j].startMs < items[i].endMs) {
          const maxNC = Math.max(numColsArr[i], numColsArr[j]);
          if (numColsArr[i] !== maxNC) { numColsArr[i] = maxNC; changed = true; }
          if (numColsArr[j] !== maxNC) { numColsArr[j] = maxNC; changed = true; }
        }
      }
    }
  }

  // colSpan = how many consecutive columns to the right are free during this event
  return items.map((item, i) => {
    const numCols = numColsArr[i];

    let colSpan = 1;
    for (let c = cols[i] + 1; c < numCols; c++) {
      const blocked = items.some(
        (other, j) =>
          j !== i &&
          cols[j] === c &&
          other.startMs < item.endMs &&
          other.endMs > item.startMs,
      );
      if (blocked) break;
      colSpan++;
    }

    return {
      event: item.event,
      top: item.top,
      height: item.height,
      col: cols[i],
      numCols,
      colSpan,
    };
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TimetableView({
  events,
  now = new Date(),
  isSaved,
  onToggleSave,
  emptyMessage = 'No hay eventos este día.',
  header,
}: TimetableViewProps) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const gridOffsetRef = useRef<number>(0);

  // Auto-select the current congress day; fall back to the first day
  const initialDay = useMemo(() => {
    const today = now.toISOString().slice(0, 10);
    return CONGRESS_DAYS.find((d) => d.date === today)?.date ?? CONGRESS_DAYS[0].date;
  }, [now]);

  const [selectedDay, setSelectedDay] = useState<string>(initialDay);

  // Partition the day's events into multi-day banners vs. timed grid blocks
  const { banners, layoutItems } = useMemo(() => {
    const dayEvents = events.filter((e) => occursOnDay(e, selectedDay));
    return {
      banners: dayEvents.filter(isMultiDay),
      layoutItems: layoutDayEvents(
        dayEvents.filter((e) => !isMultiDay(e)),
        selectedDay,
      ),
    };
  }, [events, selectedDay]);

  // Current-time indicator (null when selected day is not today)
  const nowTop = useMemo(() => {
    if (now.toISOString().slice(0, 10) !== selectedDay) return null;
    const pos =
      ((now.getTime() - dayMs(selectedDay, START_HOUR)) / 3_600_000) * HOUR_HEIGHT;
    return pos >= 0 && pos <= (END_HOUR - START_HOUR) * HOUR_HEIGHT ? pos : null;
  }, [now, selectedDay]);

  // Scroll to current time (or the first event) whenever the selected day changes.
  // gridOffsetRef tracks the Y position of the time grid within the outer ScrollView
  // so we can account for any header/daybar content rendered above it.
  useEffect(() => {
    const offset = gridOffsetRef.current;
    const targetY =
      nowTop != null
        ? Math.max(0, offset + nowTop - 80)
        : layoutItems.length > 0
        ? Math.max(0, offset + layoutItems[0].top - 48)
        : 0;
    const timer = setTimeout(
      () => scrollRef.current?.scrollTo({ y: targetY, animated: false }),
      80,
    );
    return () => clearTimeout(timer);
  }, [selectedDay, nowTop, layoutItems]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* Single outer ScrollView — contains header, day selector, banners, and the
          fixed-height time grid so that every part of the screen is scrollable. */}
      <ScrollView
        ref={scrollRef}
        style={styles.gridScroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Optional header (hero + filter passed from parent) ── */}
        {header}

        {/* ── Day selector ──────────────────────────────────────── */}
        <View style={[styles.dayWrap, { borderBottomColor: colors.border }]}>
          {CONGRESS_DAYS.map((d) => {
            const active = d.date === selectedDay;
            return (
              <Pressable
                key={d.date}
                style={[
                  styles.dayChip,
                  active
                    ? { backgroundColor: BACColors.teal }
                    : { borderWidth: 1, borderColor: colors.border },
                ]}
                onPress={() => setSelectedDay(d.date)}>
                <Text style={[styles.dayChipText, { color: active ? '#fff' : colors.text }]}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Multi-day event banners ────────────────────────────── */}
        {banners.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.bannerWrap, { borderBottomColor: colors.border }]}
            contentContainerStyle={styles.bannerRow}>
            {banners.map((ev) => {
              const c = CategoryColors[ev.category] ?? BACColors.teal;
              return (
                <Pressable
                  key={ev.id}
                  style={[styles.bannerChip, { backgroundColor: c + '22', borderColor: c }]}
                  onPress={() => router.push(`/event/${ev.id}` as never)}>
                  <MaterialIcons name="event" size={11} color={c} />
                  <Text style={[styles.bannerText, { color: c }]} numberOfLines={1}>
                    {ev.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* ── Time grid (fixed height, not a ScrollView) ─────────── */}
        <View
          style={[styles.grid, { height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }]}
          onLayout={(e) => { gridOffsetRef.current = e.nativeEvent.layout.y; }}>

          {/* Hour labels + divider lines */}
          {HOURS.map((h) => (
            <View
              key={h}
              style={[styles.hourRow, { top: (h - START_HOUR) * HOUR_HEIGHT }]}>
              <Text style={[styles.hourLabel, { color: colors.icon }]}>
                {String(h).padStart(2, '0')}:00
              </Text>
              <View style={[styles.hourLine, { backgroundColor: colors.border }]} />
            </View>
          ))}

          {/* Current-time indicator */}
          {nowTop !== null && (
            <View
              pointerEvents="none"
              style={[styles.nowRow, { top: nowTop - 4 }]}>
              <View style={[styles.nowDot, { left: TIME_COL - 5 }]} />
              <View style={[styles.nowLine, { left: TIME_COL }]} />
            </View>
          )}

          {/* Event blocks */}
          {layoutItems.map((item) => {
            const gapTotal = (item.numCols - 1) * COL_GAP;
            const colW = (screenWidth - TIME_COL - gapTotal) / item.numCols;
            const left = TIME_COL + item.col * (colW + COL_GAP);
            const width = item.colSpan * colW + (item.colSpan - 1) * COL_GAP;
            const color = CategoryColors[item.event.category] ?? BACColors.teal;
            const saved = isSaved(item.event.id);

            // Available vertical content space (paddingTop=3, height-2 rendered)
            const contentH = item.height - 5;
            const hasBiotech = (item.event.biotech_color?.length ?? 0) > 0;
            // Allocate metadata greedily after 2 reserved title lines (28px).
            // Each text row uses lineHeight:9 + marginTop:1 ≈ 9px budget here.
            let rem = contentH - 28;
            const showType     = rem >= 9; if (showType) rem -= 9;
            const showBiotech  = hasBiotech && rem >= 8; if (showBiotech) rem -= 8;
            const showCategory = rem >= 9; if (showCategory) rem -= 9;
            const showLocation = rem >= 9; if (showLocation) rem -= 9;
            // Title takes remaining space (at least 2 lines, at most 8)
            const titleLines = Math.max(2, Math.min(8, Math.floor((28 + rem) / 14)));

            return (
              <Pressable
                key={item.event.id}
                style={[
                  styles.block,
                  {
                    top: item.top + 1,
                    left,
                    width,
                    height: item.height - 2,
                    backgroundColor: color + 'E0',
                    borderLeftColor: color,
                  },
                ]}
                onPress={() => router.push(`/event/${item.event.id}` as never)}>
                <Text style={styles.blockTitle} numberOfLines={titleLines}>
                  {item.event.title}
                </Text>
                {showType && item.event.activity_type ? (
                  <Text style={styles.blockMeta} numberOfLines={1}>
                    {item.event.activity_type}
                  </Text>
                ) : null}
                {showBiotech ? (
                  <View style={styles.blockDots}>
                    {item.event.biotech_color!.map((track) => (
                      <View
                        key={track}
                        style={[styles.blockDot, { backgroundColor: TrackColors[track] ?? '#9BA1A6' }]}
                      />
                    ))}
                  </View>
                ) : null}
                {showCategory ? (
                  <Text style={styles.blockMeta} numberOfLines={1}>
                    {item.event.category}
                  </Text>
                ) : null}
                {showLocation && item.event.local_location ? (
                  <Text style={styles.blockMeta} numberOfLines={1}>
                    {item.event.local_location}
                  </Text>
                ) : null}
                <Pressable
                  hitSlop={6}
                  style={styles.blockBookmark}
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleSave(item.event.id);
                  }}>
                  <MaterialIcons
                    name={saved ? 'bookmark' : 'bookmark-border'}
                    size={13}
                    color="rgba(255,255,255,0.95)"
                  />
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        {/* Per-day empty state (no timed events and no banners) */}
        {layoutItems.length === 0 && banners.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              {emptyMessage}
            </Text>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Day selector */
  dayWrap: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  dayChip: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dayChipText: { fontSize: 13, fontWeight: '600' },

  /* Multi-day banners */
  bannerWrap: { flexGrow: 0, borderBottomWidth: 1 },
  bannerRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
  },
  bannerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 220,
  },
  bannerText: { fontSize: 11, fontWeight: '600', flexShrink: 1 },

  /* Time grid */
  gridScroll: { flex: 1 },
  grid: { position: 'relative' },

  /* Hour row: label on left, horizontal line extending right */
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: TIME_COL,
    textAlign: 'right',
    paddingRight: 8,
    fontSize: 10,
    lineHeight: 14,
    marginTop: -6, // nudge up to align text with the divider
  },
  hourLine: { flex: 1, height: 1 },

  /* Current-time indicator */
  nowRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
  },
  nowDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53E3E',
  },
  nowLine: {
    position: 'absolute',
    top: 3,
    right: 0,
    height: 2,
    backgroundColor: '#E53E3E',
  },

  /* Event block */
  block: {
    position: 'absolute',
    borderRadius: 6,
    borderLeftWidth: 3,
    paddingHorizontal: 5,
    paddingTop: 3,
    overflow: 'hidden',
  },
  blockTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginRight: 16, // leave space for the bookmark icon
  },
  blockMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    lineHeight: 9,
    marginTop: 1,
  },
  blockDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 2,
  },
  blockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blockBookmark: {
    position: 'absolute',
    top: 3,
    right: 4,
  },

  /* Per-day empty state */
  emptyWrap: { paddingTop: 48, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
