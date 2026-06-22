# Product Requirements Document (PRD) — BAC 2026 App

**Version:** 1.0 (Shipped)
**Status:** In Production — Pending Apple App Store approval
**Last Updated:** 2026-06-20
**Author:** Aleix Mariné-Tena, IT Officer at ASBTEC, Informatic's coordinator at BAC 2026
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

The app is **fully in Spanish**.

---

## 2. Goals & Non-Goals

### Goals

- Show attendees current and upcoming events in real time (Home).
- Allow browsing all congress events with filtering and search (Events).
- Display a venue map of the UAB campus with congress spaces (Map).
- Allow attendees to save events to a personal schedule stored locally on-device (My Schedule).
- List congress sponsors and speakers (Sponsors & Speakers).
- Be fast, intuitive, and usable offline.
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
- Browse the full congress programme and filter by event category and activity type.
- Find which room a session is in and read its description.
- See the venue map and know which events are happening in each space.
- Save events to their personal schedule.
- Discover sponsors and speakers at the congress.

### Secondary Users

**Congress organisers / ASBTEC Board** — they want to:

- Prepare and publish the complete event and exhibitor data before the congress opens.
- Push data corrections during the congress without requiring users to reinstall.
- Ensure sponsors and speakers receive clear visibility in the app.

---

## 5. Tab Summary

Tabs are ordered left to right in the bottom navigation bar:

| Position | Tab | Label | Icon | Default |
|---|---|---|---|---|
| 1 (leftmost) | **My Schedule** | Agenda | Bookmark | No |
| 2 | **Map** | Mapa | Map | No |
| 3 (centre) | **Home** | Inicio | House | **Yes** |
| 4 | **Events** | Eventos | Calendar | No |
| 5 (rightmost) | **Sponsors & Speakers** | Personas | People | No |

A **three-dot button (⋮)** is permanently visible in the top-right corner across all tabs and opens a global sliding side drawer.

---

## 6. Design Reference — CHI Events App

The **Cambridge Healthtech Institute (CHI) Events App** (available on iOS and Android) is the primary UX and visual design reference for this project. It is a leading conference app in the life sciences sector, recognised for its clean navigation and agenda experience.

### Key patterns adopted from CHI

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

All congress data is **bundled directly inside the app** as static **JSON files** (`data/events.json` and `data/exhibitors.json`). On startup the app fetches the latest versions from the public GitHub repository (`ASBTEC/BAC-app`, `master` branch) and caches them in AsyncStorage. If the device is offline, the last cached version (or the bundled version on first launch) is used. There are two core entities: **Event** and **Exhibitor**.

> **Data update policy:** Corrections can be pushed at any time by updating `data/events.json` or `data/exhibitors.json` on GitHub. Users will receive the update automatically on their next app launch without reinstalling.

### 7.1 Entity: Event

Represents any activity at the congress. All events share the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique event identifier |
| `title` | string | Yes | Event title |
| `description` | string | No | Full event description |
| `category` | enum | Yes | Main category: `viveBAC`, `bioBAC`, `expoBAC`, `businessBAC`, `general` |
| `activity_type` | enum | Yes | Activity type: `stand`, `talk`, `activity`, `outdoor_activity`, `round_table` |
| `start_time` | datetime (ISO 8601) | Yes | Start time |
| `end_time` | datetime (ISO 8601) | Yes | End time |
| `local_location` | string | Yes | Room or physical space within the venue (must match a space ID from the Map tab) |
| `location` | string (URL) | No | Google Maps URL for the exact location |
| `exhibitor_ids` | array of strings | No | IDs of associated exhibitors (speakers, company running a stand, etc.) |

**`category` values:**

| Value | Display label | Description |
|---|---|---|
| `viveBAC` | ViveBAC | Congress experience events: social, cultural, and networking activities |
| `bioBAC` | BioBAC | Scientific events: talks, workshops, and academic sessions |
| `expoBAC` | ExpoBAC | Exhibition events: sponsor stands and company showcases |
| `businessBAC` | BusinessBAC | Professional events: round tables, career sessions, and networking |
| `general` | General | Any event that does not fit the above categories |

**`activity_type` values:**

| Value | Display label | Icon |
|---|---|---|
| `stand` | Stand | storefront |
| `talk` | Ponencia | mic |
| `round_table` | Mesa Redonda | groups |
| `activity` | Actividad | extension |
| `outdoor_activity` | Al Aire Libre | park |

**Example JSON:**

```json
{
  "id": "event_001",
  "title": "Opening Keynote: The Future of Biotechnology",
  "description": "Inaugural keynote of BAC 2026 delivered by...",
  "category": "viveBAC",
  "activity_type": "talk",
  "start_time": "2026-07-07T09:00:00",
  "end_time": "2026-07-07T10:00:00",
  "local_location": "Sala de Graus",
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
| `photo` | string (URL) | No | Profile photo or logo URL — in practice, photos are bundled as local assets referenced via `constants/exhibitorPhotos.ts` |
| `description` | string | No | Short biography (speaker) or company description |
| `sponsor_tier` | enum | No | Sponsorship tier (only for `business` type): `platinum`, `gold`, `silver`, `bronze`, or omitted if not a sponsor |

**`sponsor_tier` values** (applicable to `exhibitor_type: business` only):

| Value | Description |
|---|---|
| `platinum` | Highest sponsorship tier |
| `gold` | Second tier |
| `silver` | Third tier |
| `bronze` | Entry-level sponsorship tier |

> **Note on photos:** Speaker photos and sponsor logos are bundled as local image assets (PNG/JPEG/SVG) and mapped by exhibitor ID in `constants/exhibitorPhotos.ts`. The `photo` field in the JSON is not currently used at runtime; `exhibitorPhotos.ts` is the authoritative source for visual assets. SVG logos support automatic light/dark variants.

**Example JSON:**

```json
[
  {
    "id": "exhibitor_042",
    "exhibitor_type": "speaker",
    "name": "Dr. Maria Puig",
    "description": "Principal investigator at CRG, specialising in genome editing."
  },
  {
    "id": "exhibitor_101",
    "exhibitor_type": "business",
    "name": "BioTechCorp S.L.",
    "description": "Leading supplier of reagents for molecular biology.",
    "sponsor_tier": "gold"
  }
]
```

---

## 8. Shared Component: Event Card

All event lists in the app use the **same `EventCard` component** (`components/EventCard.tsx`). Search, filter, sort, and temporal label widgets are shown or hidden depending on the tab that renders the component.

### Card Content

Each event card displays:

- Full date and time slot (e.g. `Martes 7 julio · 10:00 – 11:00`)
- Event title
- Local location (`local_location`)
- Activity type badge (`activity_type`), colour-coded
- Category badge (`category`)
- Primary exhibitor name (if any)
- "Add to My Schedule" bookmark icon button

Tapping a card opens the **event detail view** (`app/event/[id].tsx`), which includes:

- Status banner: "● En curso ahora" (teal) or "⏳ Comienza pronto" (amber)
- Dark navy header with activity type badge, category badge, event title, date/time, and category logo
- Location row — tappable if the `local_location` matches a known map space (deep-links to Map tab); "Abrir en Google Maps" button if `location` URL is set
- Full description
- Associated exhibitor(s): avatar/logo, name, description — tappable, navigates to exhibitor detail
- "Añadir/Eliminar de mi agenda" button

### Timetable View

All tabs that list events also offer a **Timetable View** (`components/TimetableView.tsx`) toggled via a segmented list/calendar-grid control. The timetable shows:

- Day selector chips (Martes 7 through Sábado 11 July)
- Hourly time grid from 08:00 to 24:00
- Event blocks colour-coded by category; overlapping events placed in adjacent columns
- Multi-day event banners above the grid
- Real-time current-time indicator (red line with dot), scrolled to on load
- Bookmark icon on each block to toggle My Schedule without opening the detail view

### Per-tab Configuration

| Tab | Search bar | Category filters | Type filters | Timetable view | Temporal labels |
|---|---|---|---|---|---|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ (now / upcoming / past) |
| My Schedule | ✅ | ✅ | ✅ | ✅ | ✅ (now / upcoming / past) |
| Map (space panel) | ✅ | ✅ | ✅ | ✅ | ✅ (now / upcoming) |
| Events | ✅ | ✅ | ✅ | ✅ | ❌ |

### Temporal Labels

Events display visual temporal labels:

- **NOW** — event is currently in progress (`start_time` ≤ current time ≤ `end_time`)
- **UPCOMING** — starts within the next 30 minutes
- **PAST** — already finished (shown with reduced opacity when `dimPast` is enabled)

---

## 9. Feature Specifications

### 9.1 Navigation Structure

The app uses a **bottom navigation bar** with five tabs:

```
[ 🔖 Agenda ]  [ 🗺 Mapa ]  [ 🏠 Inicio ]  [ 📅 Eventos ]  [ 👤 Personas ]
```

- The app opens on the **Inicio (Home)** tab by default.
- Navigation is persistent — switching tabs does not reset the scroll position or view state within a tab.
- Icons use **Material Icons** (`@expo/vector-icons`).
- The **three-dot button (⋮)** is permanently visible in the top-right corner of every tab's header. The Home tab renders its own custom header (no system navigation bar), so it places the ⋮ button manually in the hero section.

---

### 9.2 Global Menu (Three-dot button)

The **⋮** button opens a **sliding right-side drawer** (`components/GlobalMenu.tsx`) animated with a spring transition. It contains the following sections:

#### Apariencia (Appearance)

- Three-button segmented control: **Sistema** (auto) / **Claro** (light) / **Oscuro** (dark).
- Preference is stored via `context/theme-context.tsx` and persisted in AsyncStorage.

#### Notificaciones (Notifications)

- Toggle to enable or disable local event reminders for events saved to My Schedule.
- Subtitle: *"Recibe recordatorios antes de los eventos que hayas añadido a tu agenda personal."*
- **Lead time selector** (visible only when notifications are enabled): 5 / 10 / 15 / 30 minutes. Default: 5 minutes.
- Notifications are scheduled locally on-device; no internet connection or push service required.

#### Información (About)

A grouped navigation list with four items:

| Item | Route | Content |
|---|---|---|
| Acerca de la aplicación | `/about` | Credits (developer, beta testers), participating organisations (BAC, ASBTEC, FEBIOTEC) with logos and links |
| Aviso de privacidad | `/privacy` | Static privacy notice |
| Licenciamiento | `/license` | License information |
| Ayuda y soporte | `/support` | Contact information for technical support |

---

### 9.3 Tab: My Schedule (leftmost)

**Tab label:** Agenda  
**Icon:** bookmark  
**Purpose:** Display all events the user has saved via the bookmark icon, sorted by time proximity.

#### Behaviour

- **Global empty state** (no saved events at all): shows a centred message — *"Aún no tienes eventos guardados / Explora los eventos y pulsa el marcador para guardarlos aquí."*
- When saved events exist, displays the full filter header (see below) and the event list.
- Saved events sorted by time proximity (in-progress first, then upcoming by start time, then past events).
- Temporal labels (NOW / UPCOMING / PAST) visible. Past events shown with reduced opacity.

#### Filter Header

- Search bar filtering by event title or exhibitor name.
- Collapsible filter panel (toggle via filter icon button):
  - Category chips: BioBAC / BusinessBAC / ExpoBAC / General / ViveBAC (toggle; "all" when none active).
  - Activity type chips: Ponencia / Mesa Redonda / Actividad / Al Aire Libre / Stand.
- View toggle: list / timetable.

#### Storage

- Saved event IDs are stored on-device via AsyncStorage (`context/schedule-context.tsx`).
- Not synchronised with any server.

---

### 9.4 Tab: Map

**Tab label:** Mapa  
**Icon:** map  
**Purpose:** Display an interactive map of the congress venue at UAB, with tappable spaces that reveal current and upcoming events.

#### Map Implementation

- A **PNG floor plan** (`assets/images/map/mapa.png`) rendered as a full-width image, with an invisible **SVG overlay** of tappable `<Rect>` zones aligned to rooms in the image.
- The image/overlay supports **pinch-to-zoom** (scale 0.5×–8×) and **pan** with boundary clamping, using `react-native-gesture-handler` and `react-native-reanimated`.
- The map panel occupies 60% of the screen height; the event panel expands below when a space is selected.

#### Spaces

The following spaces are defined and tappable on the map:

| Space ID | Display label | Type | Colour |
|---|---|---|---|
| `Sala de Graus` | Sala de Graus | Aula | Light blue |
| `Espacio BusinessBAC (C1)` | Espacio BusinessBAC (C1) | Stand | Amber |
| `Sala d'Actes (C0)` | Sala d'Actes (C0) | Aula | Light blue |
| `Aula PEP Vendrell (C0/1434.)` | Aula PEP Vendrell (C0/1434.) | Aula | Light blue |
| `Pasillo ExpoBAC (C2-C1)` | Pasillo ExpoBAC | ExpoBAC corridor | Orange |
| `Catering (C0)` | Catering (C0) | Catering | Brown |
| `Espacio BusinessBAC (C2)` | Espacio BusinessBAC (C2) | Stand | Amber |
| `Exterior de la facultat de biociencies` | Exterior de la Facultat de Biociències | Outdoor | Green |

The **Exterior** space is a separate tappable button below the building panel (dashed border, green). Tapping it shows all events with `activity_type: outdoor_activity`.

A colour **legend** below the map identifies space types: Aula / Stands / ExpoBAC / Catering / Exterior.

#### Space-to-event Matching

Events are associated with a space by matching `event.local_location` to the space's `id`. For the Exterior, events with `activity_type === 'outdoor_activity'` are matched regardless of `local_location`.

#### Event Panel

When a space is tapped, an event panel appears below the map showing current and upcoming events for that space (past events are excluded). The panel includes:

- Space name header
- Search bar, collapsible category/type filter chips, and list/timetable view toggle
- Event cards with NOW/UPCOMING labels
- Empty state: *"No hay eventos actuales ni próximos en este espacio."*

#### Deep-link Support

The Map tab accepts a `space` URL param (`/(tabs)/map?space=<spaceId>`), used by the Event Detail screen to link directly to the relevant space.

---

### 9.5 Tab: Home (centre, default)

**Tab label:** Inicio  
**Icon:** house  
**Header:** Custom hero header (no system navigation bar on this tab)  
**Purpose:** Serve as the congress home screen with key identification information and real-time event tracking.

#### Hero Header

The dark navy hero section displays:

- **BAC logo** (left, from `assets/images/logo-in-app.png`)
- **Congress title:** "Congreso Anual de Biotecnología" (in Orbitron / light blue)
- **Congress year:** "BAC Barcelona 2026" (large, Orbitron Black / white)
- **Location:** "Facultad de Biociencias UAB, Barcelona" — tappable, opens Google Maps (`https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8`)
- **Date pill:** "7 – 11 de julio de 2026" (amber background) — tappable, opens Google Calendar with congress details pre-filled

The ⋮ menu button is overlaid on the top-right of the hero.

#### Filter Header (below hero)

- Search bar filtering by event title or exhibitor name.
- Filter toggle button; collapsible filter panel with:
  - Category chips: BioBAC / BusinessBAC / ExpoBAC / General / ViveBAC.
  - Divider line.
  - Activity type chips: Ponencia / Mesa Redonda / Actividad / Al Aire Libre / Stand.
- View toggle: list / timetable.

#### Event List

- SectionList with three sections: **Eventos en curso** / **Próximos eventos** / **Eventos pasados**.
- Current events sorted by start time; upcoming by start time; past in reverse chronological order.
- Temporal labels visible. Past events shown with reduced opacity.
- Updates automatically every 60 seconds (interval-based).
- Empty state: *"No se han encontrado eventos."*

---

### 9.6 Tab: Events

**Tab label:** Eventos  
**Icon:** event (calendar)  
**Purpose:** Browse the full congress programme with search, category, and type filtering.

#### Filter Header

- Search bar filtering by event title or exhibitor name.
- Filter toggle button; collapsible filter panel with:
  - Category chips: BioBAC / BusinessBAC / ExpoBAC / General / ViveBAC.
  - Divider line.
  - Activity type chips: Ponencia / Mesa Redonda / Actividad / Al Aire Libre / Stand.
- View toggle: list / timetable.

#### Event List

- All congress events sorted by `start_time` ascending.
- No temporal labels shown.
- Empty state: *"No hay eventos que coincidan con tu búsqueda."*

---

### 9.7 Tab: Sponsors & Speakers (rightmost)

**Tab label:** Personas  
**Icon:** people  
**Purpose:** List all congress exhibitors — speakers and companies/institutions.

#### Filter Header

- Search bar filtering by name.
- Type filter chips: **Todos** / **Ponentes** / **Patrocinadores** (mutually exclusive).

#### Sorting

- Businesses sorted by sponsor tier (Platinum → Gold → Silver → Bronze → untiered), then alphabetically within each tier.
- Speakers sorted alphabetically.
- When showing "Todos", businesses appear before speakers.

#### Exhibitor Card (`components/ExhibitorCard.tsx`)

Each card shows:

- Profile photo or logo (from bundled assets via `constants/exhibitorPhotos.ts`)
- Name
- Type badge: "Ponente" (teal) or "Patrocinador" (amber)
- Sponsor tier badge (if applicable)
- Short description

Tapping navigates to the **Exhibitor Detail screen** (`app/exhibitor/[id].tsx`), which shows:

- Large hero section (dark navy) with avatar/logo, name, and type badge
- Full description
- List of all events associated with this exhibitor (sorted by start time, no temporal labels)

---

## 10. Out of Scope

### 10.1 User Authentication

No login, registration, or server-side session management. The app is fully anonymous.

### 10.2 FEBIOTEC Platform Integration

The app does not connect to the FEBIOTEC website backend, user database, or ticket purchasing system.

### 10.3 In-App Messaging / Networking

No attendee messaging, meeting scheduling, or contact exchange in v1.

### 10.4 Custom Activity / Quiz Engine

No in-app quiz, voting, or gamification engine.

### 10.5 Multi-Congress / Multi-Event Support

The app is built exclusively for BAC 2026.

### 10.6 User Profile

Removed from v1 scope — the app is fully anonymous.

### 10.7 Native Calendar Integration

Calendar integration is implemented as a **Google Calendar deep link** (pre-filled event URL). Native OS calendar APIs (iOS `EventKit` / Android `CalendarContract`) are not used. This is accepted for v1.

### 10.8 Sponsor Tier Sub-filter

The Sponsors & Speakers tab does not offer a tier sub-filter (Platinum / Gold / Silver / Bronze). Sponsors are sorted by tier visually but there is no filter chip to show only a specific tier. Considered for a future update.

---

## 11. Technical Considerations

### Platform

- **Target platforms:** iOS, Android, and Web.
- **Tech stack:** **React Native + Expo** (Expo Router for file-based navigation, EAS for cloud builds).
- **New Architecture:** enabled (`newArchEnabled: true`).
- **React Compiler:** enabled (`reactCompiler: true`).
- **TypeScript strict mode:** on.

### Data Layer

- Events and exhibitors are **bundled as static JSON files** (`data/events.json`, `data/exhibitors.json`) inside the app binary.
- On every startup, `context/data-context.tsx` fetches the latest JSON from GitHub (`https://raw.githubusercontent.com/ASBTEC/BAC-app/master/data/`), validates it, caches it in AsyncStorage, and replaces the in-memory state. If the network request fails, the cached or bundled version is used.
- **Update policy:** Push a corrected JSON to GitHub. Users receive the update on their next app launch, with no reinstall required.

### Local Storage

- **Saved event IDs** (My Schedule): `context/schedule-context.tsx` via AsyncStorage.
- **Notification settings** (enabled flag + lead time): `hooks/use-notifications.ts` via AsyncStorage.
- **Theme preference** (light / dark / system): `context/theme-context.tsx` via AsyncStorage.
- No sensitive data is stored locally.

### Push Notifications

- **Local on-device notifications** via `expo-notifications`. No backend or FCM/APNs push service required.
- A notification is scheduled when an event is added to My Schedule and cancelled when it is removed.
- Default lead time: 5 minutes. User-configurable: 5 / 10 / 15 / 30 minutes.
- Requires the user to grant notification permission on their device.

### Iconography

- **Material Icons** (`@expo/vector-icons / MaterialIcons`) used throughout (tab icons, UI icons, event detail icons).

### App Distribution

- **iOS:** Apple App Store (pending review as of 2026-06-20). EAS submit configured with Apple Team ID `Q664H69PXD`.
- **Android:** Google Play Store. EAS submit configured with service account key.
- **Web:** Expo web build (secondary channel).
- EAS build profiles: `development` (internal), `preview` (APK/internal IPA), `production` (store release with auto-increment versioning).

### Routing App Coverage File

- `routing_app_coverage.geojson` is included in the project root for the Apple App Store submission. It is a GeoJSON `MultiPolygon` covering all Spanish territory (mainland, Balearic Islands, Canary Islands, Ceuta, and Melilla).

### Design Assets

- Brand assets (colours, typography, logos) are in the `brand_assets` folder and `assets/images/`.
- Colour palette and typography are defined in `constants/theme.ts` (`BACColors`, `Colors`, `OrbitronFonts`, `CategoryColors`).

---

## 12. Design Guidelines

### Branding

The app follows the **BAC 2026, ASBTEC, and FEBIOTEC visual identity**:

- **Primary dark:** `BACColors.navyDark` (`#102A43`) — used for headers and hero backgrounds.
- **Accent teal:** `BACColors.teal` (`#0D9488`) — active states, primary CTAs, NOW labels.
- **Light blue:** `BACColors.lightBlue` (`#63B3ED`) — supporting text in dark headers, classroom map zones.
- **Amber:** `BACColors.amber` (`#F6AD55`) — date pills, business badges, stand map zones.
- **Typography:** Orbitron (Regular, Bold, Black) for headings and section titles; system font for body text.

### Activity Type Colour Coding

| Activity Type | Colour |
|---|---|
| Talk | `BACColors.teal` (#0D9488) |
| Round table | Secondary brand colour |
| Activity | Amber |
| Outdoor activity | `BACColors.green` |
| Stand | Neutral grey |

### Category Colour Coding (`constants/theme.ts → CategoryColors`)

| Category | Colour |
|---|---|
| ViveBAC | Brand accent |
| BioBAC | Dark blue / navy |
| ExpoBAC | Purple / violet |
| BusinessBAC | Teal / green |
| General | Light grey |

### UX Principles

- **Two-tap rule:** Any key action reachable within 2 taps from the default screen.
- **Legible:** Minimum 14pt body text; high-contrast text on all backgrounds.
- **Graceful degradation:** Bundled/cached content shown offline; no blocking network errors.
- **Fast launch:** Interactive within 2 seconds on a mid-range device (bundled data, no required network call).

---

## 13. Open Questions

| # | Question | Owner | Status | Resolution |
|---|---|---|---|---|
| 1 | Exact congress dates and number of days? | Organising Committee | ✅ Resolved | Tuesday 7 July – Saturday 11 July 2026 (5 days) |
| 2 | Exact UAB venue and floor plan of congress spaces? | Organising Committee | ✅ Resolved | Faculty of Biosciences, UAB. PNG floor plan in `assets/images/map/mapa.png` |
| 3 | Map format: static image with tappable zones vs. interactive SVG? | Tech Lead | ✅ Resolved | PNG image with SVG overlay for tap zones + pinch/pan gesture support |
| 4 | Which spaces need to be labelled on the map? | Organising Committee | ✅ Resolved | See space table in §9.4 |
| 5 | Backend / CMS for the event and exhibitor JSON files? | Tech Lead | ✅ Resolved | No backend. JSON files in GitHub repo, fetched on startup for OTA updates |
| 6 | Who manages event data updates during the congress? | Organising Committee | ✅ Resolved | Update `data/events.json` or `data/exhibitors.json` on GitHub master; users receive changes on next launch |
| 7 | App distribution: public stores or internal? | Tech Lead | ✅ Resolved | Apple App Store + Google Play Store (primary). Web build (secondary) |
| 8 | BAC 2026 brand assets and design guidelines available? | Organising Committee | ✅ Resolved | Available in `brand_assets/` and `assets/images/` |
| 9 | Tech stack preference? | Tech Lead | ✅ Resolved | React Native + Expo |
| 10 | How far in advance should push notifications fire? | Organising Committee | ✅ Resolved | Default: 5 minutes. User-configurable (5 / 10 / 15 / 30 min) |
| 11 | Push notification provider? | Tech Lead | ✅ Resolved | `expo-notifications` — local on-device only (no backend / FCM required) |
| 12 | Google Maps URL for the congress location at UAB? | Organising Committee | ✅ Resolved | https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8 |
| 13 | Sponsor tier structure and display obligations? | Organising Committee | ✅ Resolved | Tiers: Platinum, Gold, Silver, Bronze. Displayed as badge and used for sorting. No tier sub-filter chip (§10.8) |
| 14 | Apple App Store routing coverage geographic scope? | Tech Lead | ✅ Resolved | All of Spain (mainland + Balearic Islands + Canary Islands + Ceuta + Melilla). See `routing_app_coverage.geojson` |

> ✅ All open questions resolved.

---

## 14. Milestones & Timeline

| Milestone | Target Date | Status |
|---|---|---|
| PRD finalised and approved | 2026-03-27 | ✅ Done |
| PNG floor plan of Faculty of Biosciences ready | — | ✅ Done (`assets/images/map/mapa.png`) |
| Design mockups / brand assets | — | ✅ Done |
| Alpha build — navigation + Home + Events | — | ✅ Done |
| Beta build — all 5 tabs, real event/exhibitor data | — | ✅ Done |
| App Store / Play Store submission | 2026-06-20 | ✅ Submitted — pending Apple review |
| **App live — BAC 2026 opening day** | **7 July 2026** | ⏳ Target hard deadline |

---

*This document reflects the shipped state of the app as of 2026-06-20. Update it when features change or new scope is agreed.*
