# Volley Coach

Open-source mobile app to follow a 12-week strength, power and vertical-jump program for amateur volleyball players.

Built with **Expo / React Native** + **expo-router** + **expo-sqlite** + **Zustand**. Runs locally on your device — all data stays in a local SQLite database, no backend, no analytics, no telemetry.

## Features

- 12-week structured program (4 phases) with sessions A / B / C
- Per-exercise tracking: sets, reps, RPE, rest timer, plyometric contacts
- Auto-progression rules between phases and tiers
- Body weight tracking + progress charts (CMJ, pull-up max, push-up max)
- Test weeks reminders
- Local notifications (session reminders, weight reminders)
- Plan shifting (postpone the week if you miss a session)
- Built-in glossary for technical terms

## Tech stack

| Area | Choice |
|---|---|
| Runtime | Expo SDK 54 / React Native 0.81 |
| Routing | expo-router (file-based) |
| Storage | expo-sqlite |
| State | Zustand |
| Charts | react-native-svg (custom LineChart) |
| Notifications | expo-notifications |
| Language | TypeScript |

## Getting started

### Prerequisites

- Node.js 20+
- npm
- Android: Android Studio + emulator or physical device with USB debugging
- iOS: Xcode (macOS only)

### Install & run

```bash
npm install
npx expo prebuild        # generate native projects (first time only)
npm run android          # or: npm run ios
```

For development with hot reload:

```bash
npm start                # opens Metro
```

### Type checking

```bash
npm run typecheck
```

## Project structure

```
app/                     # expo-router screens
  (tabs)/                # bottom tabs: today, progress, journal, settings
  session/[date].tsx     # active workout screen
  exercise/[slug].tsx    # exercise detail
  test/[type].tsx        # test entry (CMJ, pull-up max, push-up max)
  weight.tsx             # body weight entry
  onboarding.tsx         # initial program setup
src/
  components/            # Button, Card, Chart, RestTimer, SetInput, ...
  data/                  # static program data + glossary
  db/                    # SQLite schema, migrations, queries
  domain/                # progression rules, schedule resolution
  hooks/                 # custom hooks
  notifications/         # local-notification scheduler
  stores/                # Zustand stores (settings)
  theme.ts               # colors, spacing, radius
```

## Data & privacy

- All training data is stored **locally on your device** in SQLite.
- No network requests, no telemetry, no third-party SDK collecting data.
- The app does not require an account.

## Customizing for your own profile

The program is generic. To tailor it:

- Edit `src/data/program.ts` to change exercises, sets, reps, or progression.
- Edit `src/data/glossary.ts` to adjust terminology.
- Edit `src/domain/progression.ts` to tune the auto-progression thresholds.

## Contributing

Issues and PRs are welcome. Please:

1. Run `npm run typecheck` before opening a PR.
2. Keep changes focused — small, reviewable PRs.
3. Match the existing code style (no comments unless the *why* is non-obvious).

## License

[MIT](./LICENSE) — do whatever you want, no warranty.

## Disclaimer

This app is a personal training tool, **not medical advice**. Consult a healthcare professional before starting any new exercise program, especially if you have prior injuries or medical conditions.
