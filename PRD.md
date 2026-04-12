# Product Requirements Document (PRD) — BAC 2026 App

**Version:** 0.5 (Draft)
**Status:** In Review
**Last Updated:** 2026-03-27
**Author:** Aleix Mariné-Tena, IT Officer at ASBTEC
**Stakeholders:** ASBTEC Board, FEBIOTEC Board, BAC 2026 Organising Committee

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Context & Background](#3-context--background)
4. [Users & Use Cases](#4-users--use-cases)
5. [Tab Summary](#5-tab-summary)
6. [Design Reference — CHI Events App](#6-design-reference--chi-events-app)
7. [Data Model](#7-data-model)
   - 7.1 [Entity: Event](#71-entity-event)
   - 7.2 [Entity: Exhibitor](#72-entity-exhibitor)
8. [Shared Component: Event Card](#8-shared-component-event-card)
9. [Feature Specifications](#9-feature-specifications)
   - 9.1 [Navigation Structure](#91-navigation-structure)
   - 9.2 [Global Menu (Three-dot button)](#92-global-menu-three-dot-button)
   - 9.3 [Tab: My Schedule (leftmost)](#93-tab-my-schedule-leftmost)
   - 9.4 [Tab: Map](#94-tab-map)
   - 9.5 [Tab: Home (centre, default)](#95-tab-home-centre-default)
   - 9.6 [Tab: Events](#96-tab-events)
   - 9.7 [Tab: Sponsors & Speakers (rightmost)](#97-tab-sponsors--speakers-rightmost)
10. [Out of Scope](#10-out-of-scope)
11. [Technical Considerations](#11-technical-considerations)
12. [Design Guidelines](#12-design-guidelines)
13. [Open Questions](#13-open-questions)
14. [Milestones & Timeline](#14-milestones--timeline)

---

## 1. Overview

The **BAC 2026 App** is a lightweight mobile application designed exclusively for attendees of the **Biotechnology Annual Congress (BAC) 2026**, organised by **ASBTEC** in co-organisation with **FEBIOTEC**, and held at the **Faculty of Biosciences, Universitat Autònoma de Barcelona (UAB)**, from **Tuesday 7 July to Saturday 11 July 2026**.

The app centralises all key congress information — schedule, venue map, events, sponsors, and speakers — into a clean five-tab interface. It requires **no authentication of any kind**. The app is fully anonymous and does not collect any user data.

The design is inspired by the **Cambridge Healthtech Institute (CHI) Events App** — a well-regarded conference app in the life sciences industry — adapted to BAC's simpler scope and no-login architecture.

The app will be **fully in English**.

---

## 2. Goals & Non-Goals

### Goals

- Show attendees current and upcoming events in real time (Home).
- Allow browsing all congress events with filtering and search (Events).
- Display a venue map of the UAB campus with congress spaces (Map).
- Allow attendees to save events to a personal schedule stored locally on-device (My Schedule).
- List congress sponsors and speakers (Sponsors & Speakers).
- Be fast, intuitive, and partially usable offline.
- Be available on the opening day of BAC 2026.

### Non-Goals

- No user authentication, accounts, or server-side sessions.
- No integration with the FEBIOTEC website backend or registration/purchase database.
- No use of FEBIOTEC Google Workspace accounts.
- No in-app quiz or interactive activity engine.
- No in-app messaging or real-time networking between attendees.

---

## 3. Context & Background

ASBTEC organises the annual BAC (Biotechnology Annual Congress) for biotech students and professionals, in co-organisation with FEBIOTEC — the federation of which ASBTEC is a member association. The initial proposal was a general FEBIOTEC events app, which was scoped down to a BAC-specific app for the following reasons:

- A general FEBIOTEC events app would require connecting to the FEBIOTEC website's user and ticketing database — technically complex and outside the current project budget and timeline.
- FEBIOTEC Google Workspace accounts are restricted to board members and collaborators, and cannot serve as an open authentication layer.
- A BAC-specific app without server-side login delivers the most critical attendee value with significantly lower complexity.

The result is a congress companion app: lightweight, public, and easy to update during the event.

---

## 4. Users & Use Cases

### Primary Users

**Congress attendees** — biotech students, researchers, and professionals at BAC 2026. They want to:

- Know in real time what is happening now and what is coming up next.
- Browse the full congress programme and filter by event category.
- Find which room a session is in and read its description.
- See the venue map and know which events are happening in each space.
- Save events to their personal schedule.
- Discover sponsors and speakers at the congress.

### Secondary Users

**Congress organisers / ASBTEC Board** — they want to:

- Prepare and publish the complete event and exhibitor data before the congress opens.
- Ensure sponsors and speakers receive clear visibility in the app.

---

## 5. Tab Summary

Tabs are ordered left to right in the bottom navigation bar:

| Position | Tab | Icon | Default |
|---|---|---|---|
| 1 (leftmost) | **My Schedule** | Bookmark / star | No |
| 2 | **Map** | Location pin | No |
| 3 (centre) | **Home** | House | **Yes** |
| 4 | **Events** | Calendar | No |
| 5 (rightmost) | **Sponsors & Speakers** | Person silhouette | No |

A **three-dot button (⋮)** is permanently visible in the top-right corner across all tabs and opens a global sliding menu.

---

## 6. Design Reference — CHI Events App

The **Cambridge Healthtech Institute (CHI) Events App** (available on iOS and Android) is the primary UX and visual design reference for this project. It is a leading conference app in the life sciences sector, recognised for its clean navigation and agenda experience.

### Key patterns to adopt from CHI

- **Bottom navigation bar** with clearly labelled tabs and icons.
- **Event cards** showing title, time slot, location, and event type coded by colour.
- **Event detail view** accessible by tapping a card — with title, time, room, speakers, and description.
- **Exhibitor/speaker list** with search and type filtering.
- **Card-based layout** throughout: light background, subtle shadows, clear typographic hierarchy.

### Key differences from CHI (BAC-specific adaptations)

| CHI App | BAC 2026 App |
|---|---|
| Login required (email / SSO) | No login — fully anonymous |
| Personalised agenda synced to server | Personal schedule stored on-device only |
| 1-on-1 networking & in-app messaging | Not included in v1 |
| Multi-conference switcher | Single congress only |
| QR check-in for sessions | Out of scope for v1 |

---

## 7. Data Model

All congress data is **bundled directly inside the app** as static **JSON files** embedded in the APK/IPA at build time. There is no remote server or backend. There are two core entities: **Event** and **Exhibitor**.

> **MVP data update policy:** There are no live data updates during the congress. If a correction is needed, a new app build must be released and users must reinstall. This is an accepted constraint for the MVP.

### 7.1 Entity: Event

Represents any activity at the congress. All events share the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique event identifier |
| `title` | string | Yes | Event title |
| `description` | string | No | Full event description |
| `category` | enum | Yes | Main category: `viveBAC`, `bioBAC`, `expoBAC`, `businessBAC`, `other` |
| `activity_type` | enum | Yes | Activity type: `stand`, `talk`, `activity`, `outdoor_activity`, `round_table` |
| `start_time` | datetime (ISO 8601) | Yes | Start time |
| `end_time` | datetime (ISO 8601) | Yes | End time |
| `local_location` | string | Yes | Room or physical space within the venue (e.g. "Main Auditorium", "Room B2") |
| `location` | string (URL) | No | Google Maps URL for the exact location |
| `exhibitor_ids` | array of strings | No | IDs of associated exhibitors (speakers, company running a stand, etc.) |

**`category` values:**

| Value | Description |
|---|---|
| `viveBAC` | Congress experience events: social, cultural, and networking activities |
| `bioBAC` | Scientific events: talks, workshops, and academic sessions |
| `expoBAC` | Exhibition events: sponsor stands and company showcases |
| `businessBAC` | Professional events: round tables, career sessions, and networking |
| `other` | Any event that does not fit the above categories |

**`activity_type` values:**

| Value | Description |
|---|---|
| `stand` | Company or institution exhibition stand |
| `talk` | Keynote, lecture, or presentation |
| `activity` | Participatory activity in an indoor space |
| `outdoor_activity` | Participatory activity in an outdoor space |
| `round_table` | Round table discussion or panel debate |

**Example JSON:**

```json
{
  "id": "event_001",
  "title": "Opening Keynote: The Future of Biotechnology",
  "description": "Inaugural keynote of BAC 2026 delivered by...",
  "category": "viveBAC",
  "activity_type": "talk",
  "start_time": "2026-05-15T09:00:00",
  "end_time": "2026-05-15T10:00:00",
  "local_location": "Main Auditorium",
  "location": "https://maps.google.com/?q=...",
  "exhibitor_ids": ["exhibitor_042"]
}
```

---

### 7.2 Entity: Exhibitor

Represents a person (speaker) or a company/institution (stand, sponsor) associated with the congress.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique exhibitor identifier |
| `exhibitor_type` | enum | Yes | `speaker` or `business` |
| `name` | string | Yes | Speaker name or company/institution name |
| `photo` | string (URL) | No | Profile photo URL (speaker) or logo URL (company) |
| `description` | string | No | Short biography (speaker) or company description |
| `sponsor_tier` | enum | No | Sponsorship tier (only for `business` type): `platinum`, `gold`, `silver`, `bronze`, or omitted if not a sponsor |

**`sponsor_tier` values** (applicable to `exhibitor_type: business` only):

| Value | Description |
|---|---|
| `platinum` | Highest sponsorship tier |
| `gold` | Second tier |
| `silver` | Third tier |
| `bronze` | Entry-level sponsorship tier |

**Example JSON:**

```json
[
  {
    "id": "exhibitor_042",
    "exhibitor_type": "speaker",
    "name": "Dr. Maria Puig",
    "photo": "https://cdn.bac2026.cat/speakers/maria_puig.jpg",
    "description": "Principal investigator at CRG, specialising in genome editing."
  },
  {
    "id": "exhibitor_101",
    "exhibitor_type": "business",
    "name": "BioTechCorp S.L.",
    "photo": "https://cdn.bac2026.cat/sponsors/biotechcorp_logo.png",
    "description": "Leading supplier of reagents for molecular biology.",
    "sponsor_tier": "gold"
  }
]
```

---

## 8. Shared Component: Event Card

All event lists in the app (Home, Events, My Schedule, Map space detail) use the **same event card component**. Search, filter, sort, and temporal label widgets are shown or hidden depending on the tab that renders the component.

### Card Content

Each event card displays:

- Time slot (start time – end time)
- Event title
- Local location (`local_location`)
- Activity type badge (`activity_type`), colour-coded
- Category badge (`category`)
- Primary exhibitor name (if any)
- "Add to My Schedule" button (bookmark icon)

Tapping a card opens the **event detail view**, which includes:

- All card fields
- Full description
- Associated exhibitor(s): photo/logo, name, and description
- "Open in Google Maps" button (if `location` is present)
- "Add to My Schedule" / "Remove from My Schedule" toggle

### Per-tab Configuration

| Tab | Search bar | Quick filters | Sort | Temporal labels |
|---|---|---|---|---|
| Home | ❌ | ❌ | By time proximity | ✅ (now / upcoming / past) |
| My Schedule | ❌ | ❌ | By time proximity | ✅ (now / upcoming / past) |
| Map (space detail) | ❌ | ❌ | By start time | ✅ (now / upcoming) |
| Events | ✅ | ✅ (category) | By start time | ❌ |

### Temporal Labels

Events can display visual temporal labels:

- **NOW** — event is currently in progress (`start_time` ≤ current time ≤ `end_time`)
- **UPCOMING** — starts within the next 30 minutes
- **PAST** — already finished (shown with reduced opacity)

---

## 9. Feature Specifications

### 9.1 Navigation Structure

The app uses a **bottom navigation bar** with five tabs:

```
[ ★ My Schedule ]  [ 📍 Map ]  [ 🏠 Home ]  [ 📅 Events ]  [ 👤 Sponsors & Speakers ]
```

- The app opens on the **Home** tab by default.
- Navigation is persistent — switching tabs does not reset the scroll position or view state within a tab.
- Icons follow a consistent icon set (e.g. Material Symbols or Phosphor Icons).
- The **three-dot button (⋮)** is permanently visible in the top-right corner of every screen.

---

### 9.2 Global Menu (Three-dot button)

The **⋮** button in the top-right corner of the app opens a **sliding side drawer** with the following options:

#### Notification Settings

- Toggle to enable or disable push notifications for events saved to My Schedule.
- Explanatory subtitle: *"Receive reminders before events you have added to your personal schedule."*
- **Lead time selector:** Configurable reminder time before the event. Default: **5 minutes**. Options: 5 / 10 / 15 / 30 minutes.
- Notifications are scheduled locally on-device — no internet connection is required.

#### Privacy Notice

- Static page with the app privacy notice.
- Content: *"This app does not collect any personal data from its users. All saved information (personal schedule) is stored exclusively on your device and is never transmitted to any server."*

#### Help & Support

- Contact section with the following information:
  - Email: **amarine@asbtec.cat**
  - Description: *"For any technical issues with the app, contact the ASBTEC IT Officer."*

---

### 9.3 Tab: My Schedule (leftmost)

**Icon:** Bookmark / star
**Purpose:** Display all events the user has saved via "Add to My Schedule", sorted by time proximity.

#### Behaviour

- Saved events are displayed ordered by `start_time` ascending, with past events shown last (reduced opacity).
- Uses the event card component with no search bar and no filters.
- Temporal labels (NOW / UPCOMING / PAST) are visible.
- If no events have been saved: empty state with the message *"You haven't added any events to your schedule yet. Browse Events and tap the bookmark icon to save them here."*

#### Storage

- Saved event IDs are stored on-device (AsyncStorage / SharedPreferences equivalent).
- Not synchronised with any server.

---

### 9.4 Tab: Map

**Icon:** Location pin
**Purpose:** Display a local map of the congress venue at UAB, with all spaces and rooms labelled, to help attendees navigate the site.

#### Content

- An **interactive SVG map** of the Faculty of Biosciences, UAB, bundled as a local app asset.
- The SVG has tappable zones defined for each labelled space.

The following spaces must be labelled on the map:

| Space | Type |
|---|---|
| Auditorium | Classroom |
| Classroom 1 | Classroom |
| Classroom 2 | Classroom |
| Laboratory | Classroom |
| Stand area(s) | Stand location |

Only classrooms and stand locations are labelled. General services, toilets, and circulation areas are not required for the MVP.

#### Interaction

- Tapping any **labelled space** on the SVG map opens a **bottom sheet panel** showing current or upcoming events in that space, using the event card component (no search, no filters, sorted by start time, with NOW / UPCOMING labels).
- If no current or upcoming events exist for a space: *"No upcoming events in this space."*

#### Open Items

- [ ] Confirm the exact room names/numbers for Classroom 1, Classroom 2, and the Laboratory.
- [ ] Obtain or produce the interactive SVG floor plan of the Faculty of Biosciences.

---

### 9.5 Tab: Home (centre, default)

**Icon:** House
**Purpose:** Serve as the congress home screen, showing key identification information at a glance and real-time current and upcoming events.

#### Top Section — Congress Header

The top of the screen prominently displays:

- **Congress title:** Biotechnology Annual Congress (BAC) 2026
- **Location:** "UAB Barcelona" — **tappable**, opens Google Maps at: `https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8`
- **Congress dates:** 7–11 July 2026, displayed as pills or labels — each date (or the full date range) is **tappable** and allows adding the congress to the device calendar (Google Calendar, Apple Calendar, etc.) via the native OS calendar integration.

#### Bottom Section — Current & Upcoming Events

- Event list sorted by **time proximity** (in-progress and soonest-to-start events first).
- **Stands (`activity_type: stand`) are excluded** from this view, as they run continuously throughout the congress and do not add value in a time-proximity list.
- Uses the event card component with no search bar and no quick filters.
- Temporal labels (NOW / UPCOMING / PAST) are visible.
- The list refreshes automatically in the background.

---

### 9.6 Tab: Events

**Icon:** Calendar
**Purpose:** List all congress events with search and category filtering, allowing attendees to explore the full programme.

#### Header

- **Search bar** at the top: filters by event title, speaker name, or company in real time.
- **Quick filter buttons** by category, displayed horizontally:
  - All (default)
  - ViveBAC
  - BioBAC
  - ExpoBAC
  - BusinessBAC
  - Other
- Category filters are mutually exclusive (only one active at a time).

#### Event List

- All congress events, sorted by `start_time` ascending by default.
- Uses the event card component with search bar and filters visible.
- Temporal labels are not shown in this view (full programme view, not real-time).

---

### 9.7 Tab: Sponsors & Speakers (rightmost)

**Icon:** Person silhouette
**Purpose:** List all congress exhibitors — both speakers and companies/institutions — allowing attendees to discover and learn about them.

#### Header

- **Search bar** filtering by name.
- **Quick filter** by type: All / Speakers / Companies.
- When filtering by Companies, an additional **tier filter** is available: All / Platinum / Gold / Silver / Bronze.

#### Exhibitor Card

Each exhibitor is shown on a card with:

- Profile photo or logo (`photo`)
- Name (`name`)
- Type badge (`exhibitor_type`): "Speaker" or "Company"
- Sponsor tier badge (`sponsor_tier`) — displayed only for businesses that have a tier set (e.g. "Gold Sponsor")
- Short description (`description`)

Companies are sorted by sponsor tier (Platinum first, then Gold, Silver, Bronze, then non-tiered) and then alphabetically within each tier. Speakers are sorted alphabetically.

Tapping an exhibitor card opens the **exhibitor detail view**, which includes:

- Full-size photo or logo
- Name, sponsor tier (if applicable), and full description
- List of events associated with this exhibitor (using the event card component with no search and no filters)

---

## 10. Out of Scope

### 10.1 User Authentication

No login, registration, or server-side session management. The app is fully anonymous.

### 10.2 FEBIOTEC Platform Integration

The app will not connect to the FEBIOTEC website backend, user database, or ticket purchasing system.

### 10.3 In-App Messaging / Networking

No attendee messaging, meeting scheduling, or contact exchange in v1. Candidate for v2.

### 10.4 Custom Activity / Quiz Engine

No in-app quiz, voting, or gamification engine. Interactive activity content is hosted on external URLs.

### 10.5 Multi-Congress / Multi-Event Support

The app is built exclusively for BAC 2026. A generalised FEBIOTEC events platform is out of scope for this version.

### 10.6 User Profile

A local user profile tab was considered in earlier versions of this PRD. It has been removed from the v1 scope, as the app is fully anonymous and no use case requires a local identity.

---

## 11. Technical Considerations

### Platform

- **Target platforms:** iOS and Android.
- **Tech stack:** **React Native** (cross-platform, single codebase).

### Data Layer

- All events and exhibitors are **bundled as static JSON files inside the app binary** (embedded in the APK / IPA at build time).
- There is **no backend, no CMS, and no remote server** for the MVP. All data is available offline from first launch with no network request required.
- **MVP update policy:** If event or exhibitor data needs to be corrected, a new app build must be released and users must reinstall the app. This is an accepted trade-off for the MVP.
- Local storage (AsyncStorage) is used only for user preferences: saved event IDs (My Schedule) and notification settings.

### Local Storage

- Saved event IDs (My Schedule) and notification preferences are stored on-device via AsyncStorage.
- No sensitive data is stored locally.

### No Server Authentication

- No backend means no auth layer of any kind. All data is local to the device.

### Push Notifications

- Push notifications are **triggered locally on-device** by the app, with no backend or push notification service (e.g. no Firebase Cloud Messaging required for the MVP).
- React Native's local notification library (e.g. `notifee` or `react-native-push-notification`) schedules a notification for each event saved to My Schedule.
- **Default lead time:** 5 minutes before the event start time.
- **User-configurable:** The lead time can be adjusted in the Notification Settings drawer. Options to be defined (e.g. 5 / 10 / 15 / 30 minutes).
- Notifications are only fired if the user has granted notification permission on their device.

### Calendar Integration

- Adding congress dates to the device calendar uses the native OS calendar API (iOS: `EventKit`; Android: `CalendarContract`), with no third-party services required.
- A React Native bridge library such as `react-native-calendar-events` can be used.

### App Distribution

- **Primary channels:** Apple App Store and Google Play Store (public listings).
- **Static landing page:** A simple web page hosted on Vercel, Netlify, or similar, linking to both stores. This is a secondary channel and a lower priority than the store listings.
- Brand assets are available in the `brand_assets` folder and should be used for store listing graphics (icon, screenshots, feature graphic).

### Design Assets

- Brand assets (colours, typography, logos) are available in the `brand_assets` folder in the project repository.

---

## 12. Design Guidelines

### Design Reference

The visual style follows the CHI Events App conventions: light card-based layouts, strong typographic hierarchy, and colour-coded event types. Specific brand colours, typography, and graphic assets will be provided by the BAC 2026 organising committee.

### Branding

- The app must follow the **BAC 2026, ASBTEC, and FEBIOTEC visual identity** guidelines.
- Brand assets (colours, typography, logos, and guidelines) are available in the **`brand_assets` folder** in the project repository.

### UX Principles

- **Two-tap rule:** Any key action (find an event, view the map, look up a speaker) must be reachable within 2 taps from the default screen.
- **Legible:** Minimum 14pt body text; high-contrast text on all backgrounds.
- **Graceful degradation:** Cached content shown when offline; clear, non-intrusive error states when live data is unavailable.
- **Fast launch:** The app must be interactive within 2 seconds on a mid-range device.

### Activity Type Colour Coding

| Activity Type | Suggested Colour |
|---|---|
| Talk | Primary brand colour |
| Round table | Secondary brand colour |
| Activity | Warm accent (e.g. amber) |
| Outdoor activity | Green |
| Stand | Neutral grey |

### Category Colour Coding

| Category | Suggested Colour |
|---|---|
| ViveBAC | Brand accent |
| BioBAC | Dark blue / navy |
| ExpoBAC | Purple / violet |
| BusinessBAC | Teal / green |
| Other | Light grey |

### Iconography

- Use a consistent icon library throughout (e.g. Material Symbols or Phosphor Icons).
- Tab bar icons must be clearly recognisable at 24px.

---

## 13. Open Questions

| # | Question | Owner | Status | Resolution |
|---|---|---|---|---|
| 1 | Exact congress dates and number of days? | Organising Committee | ✅ Resolved | Tuesday 7 July – Saturday 11 July 2026 (5 days) |
| 2 | Exact UAB venue and floor plan of congress spaces? | Organising Committee | ✅ Resolved | Faculty of Biosciences, UAB. Spaces: Auditorium, 2 classrooms, 1 laboratory, stand area(s) |
| 3 | Map format: static image with tappable zones vs. interactive SVG? | Tech Lead | ✅ Resolved | Interactive SVG |
| 4 | Which spaces need to be labelled on the map? | Organising Committee | ✅ Resolved | Classrooms and stand locations only |
| 5 | Backend / CMS for the event and exhibitor JSON files? | Tech Lead | ✅ Resolved | No backend. JSON files embedded in the APK/IPA at build time |
| 6 | Who manages event data updates during the congress? | Organising Committee | ✅ Resolved | No live updates. If needed, a new build must be released and users must reinstall |
| 7 | App distribution: public stores or internal? | Tech Lead | ✅ Resolved | Apple App Store + Google Play Store (primary). Static web page on Vercel/Netlify (secondary) |
| 8 | BAC 2026 brand assets and design guidelines available? | Organising Committee | ✅ Resolved | Available in the `brand_assets` folder |
| 9 | Tech stack preference? | Tech Lead | ✅ Resolved | React Native |
| 10 | How far in advance should push notifications fire? | Organising Committee | ✅ Resolved | Default: 5 minutes. User-configurable (5 / 10 / 15 / 30 min) |
| 11 | Push notification provider? | Tech Lead | ✅ Resolved | Local on-device notifications only (no backend / FCM required) |
| 12 | Google Maps URL for the congress location at UAB? | Organising Committee | ✅ Resolved | https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8 |
| 13 | Sponsor tier structure and display obligations? | Organising Committee | ✅ Resolved | Tiers: Platinum, Gold, Silver, Bronze. No contractual obligations; tier stored as `sponsor_tier` field on the exhibitor entity |

> ✅ All open questions resolved. No blockers remaining for development to begin.

---

## 14. Milestones & Timeline

> ⚠️ Target dates are placeholders and must be set relative to the BAC 2026 opening date of **7 July 2026**.

| Milestone | Target Date | Notes |
|---|---|---|
| PRD finalised and approved | TBD | ✅ All open questions resolved |
| SVG floor plan of Faculty of Biosciences ready | TBD | Blocker for Map tab development |
| Design mockups ready (all 5 tabs) | TBD | Brand assets available in `brand_assets` folder |
| Alpha build — navigation + Home + Events | TBD | Internal testing only |
| Beta build — all 5 tabs, real event/exhibitor data | TBD | Organiser UAT with final JSON content |
| App Store / Play Store submission | TBD | Allow 1–2 weeks for review |
| **App live — BAC 2026 opening day** | **7 July 2026** | Hard deadline |

---

*This document is a living draft. Please add corrections or comments via the designated review channel or directly in this file.*
