# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BAC-app is a conference mobile application for the BAC Barcelona 2026 event, built with Expo/React Native. It targets Android, iOS, and Web. Planned features include: Agenda (calendar scheduling), Up-to-date (ASBTEC/FEBiotec news), Attendees (sponsors/companies), and Activities (QR-unlocked content).

## Design

Use `PRD.md` to search requirements and design of the application.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
npm run lint       # Run ESLint
npm run reset-project  # Reset to blank Expo template
```

### EAS (Cloud Builds)
```bash
eas login
eas build --platform android --profile development   # Dev build (requires Expo Go/dev client)
eas build --platform android --profile preview       # APK for testing
eas build --platform android --profile production    # Release build
```

## Architecture

**Routing**: Expo Router (file-based). Files in `app/` become routes automatically. `(tabs)/` is a route group with bottom-tab navigation.

**Navigation hierarchy**:
- `app/_layout.tsx` — root Stack, wraps ThemeProvider
- `app/(tabs)/_layout.tsx` — bottom tabs, defines tab icons and haptics
- `app/(tabs)/index.tsx` — Home tab
- `app/(tabs)/explore.tsx` — Explore tab
- `app/modal.tsx` — modal screen (accessed via `router.push('/modal')`)

**Theming**: Light/dark mode is system-driven. Color palette is in `constants/theme.ts`. Use `ThemedText`/`ThemedView` from `components/` for automatic theme application. Use the `useThemeColor` hook when you need a raw color value.

**Icons**: `components/ui/icon-symbol.tsx` is platform-aware — `icon-symbol.ios.tsx` uses SF Symbols (native), the base file maps to Material Icons for Android/Web. Always add new icons to both files.

**Path alias**: `@/*` maps to the repo root (e.g., `import { Colors } from '@/constants/theme'`).

## Key Setup Requirements

- Node.js v20 (via nvm)
- Android Studio + Android SDK (emulator, platform-tools, cmdline-tools must be on PATH)
- EAS CLI: `npm install -g eas-cli`

## Notes

- New Architecture is enabled (`newArchEnabled: true` in app.json)
- React Compiler experiment is enabled (`reactCompiler: true`)
- TypeScript strict mode is on — no implicit any, strict null checks
