<div align="center">

# 🧱 Mathris

### Tetris × Mathematics — A Mobile Educational Game

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green)](https://expo.dev)

**Mathris** is a free, open-source mobile game that fuses the addictive mechanics of Tetris with curriculum-aligned math practice. Bricks fall — equations appear — you solve them before they land.

[▶ How to Run](#-getting-started) · [🏗 Architecture](#-architecture) · [🎮 Gameplay](#-gameplay) · [📊 Dashboard](#-parent--teacher-dashboard) · [🤝 Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Who Is This For?](#-who-is-this-for)
- [Features at a Glance](#-features-at-a-glance)
- [Gameplay](#-gameplay)
- [Difficulty System](#-difficulty-system)
- [Special Mechanics](#-special-mechanics)
- [Architecture](#-architecture)
- [Data Layer](#-data-layer--repository-pattern)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running on Android Studio](#-running-on-android-studio)
- [Parent & Teacher Dashboard](#-parent--teacher-dashboard)
- [Design Principles](#-design-principles)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Who Is This For?

Mathris is built for **three audiences**:

| Audience | How they use it |
|---|---|
| 🧒 **Students (ages 8–16)** | Play the game to practise math without it feeling like homework. The Tetris pressure makes every equation feel urgent and satisfying. |
| 👨‍👩‍👧 **Parents** | Open the built-in Dashboard to see exactly which topics their child struggles with — no account needed, everything is on-device. |
| 🏫 **Teachers** | Assign difficulty levels or topic filters as in-class drills. The wrong-answer log turns every game session into a targeted study list. |

**Why a game?**
Research consistently shows that spaced-repetition under mild time pressure dramatically improves arithmetic fluency. Mathris creates that pressure naturally — through falling bricks — while keeping the experience fun rather than punitive. Wrong answers become teaching moments, not failures.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🧮 **Three difficulty tiers** | Arithmetic → Single-variable algebra → Systems of equations |
| 🔢 Live block equations | Equations are printed directly on the blocks (both falling and grounded) |
| 🎮 Cascading Gravity | Solving a block under existing blocks causes the upper blocks to drop down |
| ⌨️ **Answer keypad** | Custom numpad at the bottom — optimised for speed and touch |
| 🧊 **Freeze tokens** | Pause a brick mid-fall for 10 seconds — buy time to think |
| 💡 **Hint tokens** | Reveal step-by-step solutions mid-game |
| 🔥 **Hot Streak combo** | 3+ correct answers in a row doubles your score temporarily |
| 📝 **Wrong-answer log** | Every missed equation saved and reviewed after the game |
| 📊 **Parent/Teacher Dashboard** | Per-topic accuracy charts, score history, weakest-concept flags |
| 🎯 **Topic Filter / Practice Mode** | Drill a single topic (e.g. "only division") without full game pressure |
| 🏆 **XP & Level progression** | Persistent experience points across sessions |
| 📴 **Fully offline** | All data stored locally — no account, no internet required |

---

## 🎮 Gameplay

```
┌─────────────────────────────────┐
│  MATHRIS          Score: 1,240  │
│  Level: 3    Combo: ×2  🔥      │
│                                 │
│  ░░░░░░░░░░  ← 10-column grid   │
│  ░░░░░░░░░░                     │
│  ░░░░░░░░░░                     │
│       ┌──────┐                  │
│       │6×7=? │  ← falling brick │
│       └──────┘                  │
│  ░░░░░░░░░░                     │
│  ████░░████  ← locked bricks    │
│  ████████░░                     │
├─────────────────────────────────┤
│  ◀   ↻   ▼▼   ▶  ← controls    │
│  🧊 Freeze (3)  💡 Hint (3)    │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │  Answer:  4  2          │   │
│  └─────────────────────────┘   │
│  [7][8][9]  [4][5][6]          │
│  [1][2][3]  [-][0][⌫]          │
│  [        ✓ Submit         ]   │
└─────────────────────────────────┘
```

**The core loop:**
1. Tetrominoes fall from the top with equations printed directly on them.
2. Solve any block in the air (for +10 points) or on the ground (for +5 points) by submitting its answer.
3. Solving a block makes it disappear with a burst animation, and any blocks stacked on top cascade down according to gravity.
4. Completing a straight horizontal row clears the row, bursts all related piece cells, and awards +100 points.

The Tetris pressure is preserved — but now it has a *mathematical cause*.

---

## 📐 Difficulty System

### 🟢 Easy — Arithmetic

Standard Tetris brick widths. Four operations taught in progression:

| Sub-level | Content | Example |
|---|---|---|
| 1 | Single-digit multiplication | `6 × 7 = ?` |
| 2 | Two-digit addition / subtraction | `47 + 38 = ?` |
| 3 | Mixed operations | `84 ÷ 6 = ?` |
| 4 | Larger numbers | `1020 − 385 = ?` |

### 🟡 Medium — Single-Variable Algebra

Wider bricks to fit the equation. Answer format: `X=5`

| Sub-level | Content | Example |
|---|---|---|
| 1 | One-step equations | `X + 5 = 12` |
| 2 | Two-step equations | `2X − 3 = 7` |
| 3 | Rational equations | `275 ÷ X = 5` |

### 🔴 Hard — Systems of Equations

Double-wide bricks. Fall 40% slower to give thinking time. Answer format: `X=2,Y=1`

| Sub-level | Content | Example |
|---|---|---|
| 1 | Integer solutions | `5X + 3Y = 13` / `3Y − X = 1` |
| 2 | Decimal solutions | `2.5X + Y = 8` |
| 3 | Fractional solutions | `X/2 + Y = 4` |

---

## ⚡ Special Mechanics

### 🧊 Freeze Token
Hold a falling brick completely still for **10 seconds**. 3 tokens per game. Removes frustration on hard equations — teaches children it's okay to slow down and think.

### 💡 Hint Token
Reveals a **step-by-step solution** in a bottom-sheet modal. Each step appears one at a time:
- **Easy:** `6 × 7 → 6+6+6+6+6+6+6 = 42`
- **Medium:** Full algebraic isolation steps
- **Hard:** Substitution method, step by step

Costs 50 score points. Framed as a teaching moment, not cheating.

### 🔥 Hot Streak
Solve **3+ bricks correctly without a miss** and the Hot Streak banner ignites — score doubles for the duration. Resets on first wrong answer.

### 📝 Wrong-Answer Review
After every game, a **Review Screen** lists every equation you got wrong alongside the correct answer. Framed as:
> *"Let's look at these together 🤝"*

Not punishment — a targeted study list generated automatically.

### 🎯 Topic Filter / Practice Mode
Select a specific topic (e.g. *"only division"* or *"one-step algebra"*) from the Practice screen. Only equations of that type fall — perfect for drilling a weak spot without full game pressure.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Screens (Expo Router)                │
│  index.tsx  │  game.tsx  │  review.tsx  │  dashboard.tsx   │
└──────────────────────────┬──────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────┐
│                  Zustand State Stores                        │
│          gameStore.ts          progressStore.ts              │
│   (grid, brick, score,    (XP, mastery, wrong-answer log,   │
│    combo, tokens, phase)   session history)                  │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │ calls
               │                ┌─────────▼───────────────────┐
               │                │   IRepository (interface)    │
               │                │   data/repository.ts         │
               │                └─────────┬───────────────────┘
               │                          │ implemented by
               │                ┌─────────▼───────────────────┐
               │                │   SQLiteRepository           │
               │                │   data/sqliteRepository.ts   │
               │                │   (expo-sqlite, WAL mode,    │
               │                │    versioned migrations)     │
               │                └─────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                     Core Game Engine                         │
│  engine/engine.ts    │  engine/bricks.ts                    │
│  (grid, collision,   │  (7 tetrominoes, rotation,           │
│   row clears,        │   speed penalty, ghost piece)        │
│   game-over check)   │                                      │
├──────────────────────┼──────────────────────────────────────┤
│  engine/equations.ts │  engine/audio.ts                     │
│  (Easy/Med/Hard      │  (expo-av: lock, clear, wrong,       │
│   generators,        │   streak, freeze, hint, gameover)    │
│   validator, hints)  │                                      │
└─────────────────────────────────────────────────────────────┘
```

### Component Tree

```
RootLayout (_layout.tsx)
  └─ SQLiteRepository.initialize()  ← migrations run here
  └─ progressStore.load()           ← hydrate Zustand from DB
  └─ Stack Navigator
       ├─ MenuScreen (index.tsx)
       │    ├─ difficulty selector
       │    ├─ player stats bar
       │    └─ → Dashboard / Practice links
       ├─ GameScreen (game.tsx)
       │    ├─ HUD (score, level, combo, tokens)
       │    ├─ GameBoard (Skia canvas)
       │    ├─ Brick controls (move/rotate/drop)
       │    ├─ Power-up bar (freeze, hint)
       │    ├─ Keypad (answer input)
       │    └─ HintModal (step-by-step)
       ├─ ReviewScreen (review.tsx)
       │    ├─ StarRating
       │    └─ wrong-answer cards
       ├─ DashboardScreen (dashboard.tsx)
       │    ├─ overview stat cards
       │    ├─ accuracy by topic (bar chart)
       │    ├─ score history (line chart)
       │    └─ weakest-topic progress bars
       └─ TopicSelectScreen (topic-select.tsx)
```

---

## 🗄 Data Layer — Repository Pattern

The entire persistence layer is hidden behind a single TypeScript interface. **Swapping the database requires changing one line.**

```typescript
// data/repository.ts — the contract every backend must satisfy
export interface IRepository {
  initialize(): Promise<void>;
  getXP(): Promise<number>;
  addXP(amount: number): Promise<void>;
  recordSession(score: number, accuracy: number): Promise<void>;
  getSessions(limit?: number): Promise<SessionRecord[]>;
  getTotalGames(): Promise<number>;
  updateMastery(topic: string, correct: boolean): Promise<void>;
  getMasteryByTopic(): Promise<Record<string, MasteryEntry>>;
  recordWrongAnswer(entry: Omit<WrongAnswerEntry, 'id'>): Promise<void>;
  getWrongAnswers(limit?: number): Promise<WrongAnswerEntry[]>;
  clearWrongAnswers(): Promise<void>;
  clearAll(): Promise<void>;
}
```

```typescript
// app/_layout.tsx — THE single swap point
await setRepository(new SQLiteRepository());   // ← change this line only

// Future alternatives (just implement IRepository):
// await setRepository(new SupabaseRepository(client));  // cloud sync
// await setRepository(new InMemoryRepository());        // unit tests
```

### SQLite Schema

```sql
-- Schema versioning
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

-- Player profile (single row)
CREATE TABLE player (
  id    INTEGER PRIMARY KEY CHECK (id = 1),
  xp    INTEGER NOT NULL DEFAULT 0,
  games INTEGER NOT NULL DEFAULT 0
);

-- Game sessions
CREATE TABLE sessions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  score     INTEGER NOT NULL,
  accuracy  REAL    NOT NULL,
  played_at INTEGER NOT NULL
);

-- Per-topic accuracy
CREATE TABLE mastery (
  topic    TEXT    PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct  INTEGER NOT NULL DEFAULT 0
);

-- Wrong answer history
CREATE TABLE wrong_answers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  equation       TEXT NOT NULL,
  user_answer    TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic          TEXT NOT NULL,
  difficulty     TEXT NOT NULL,
  answered_at    INTEGER NOT NULL
);
```

Features:
- **WAL journal mode** — better concurrent read performance
- **Versioned migrations** — schema evolves safely across app updates
- **UPSERT mastery** — atomic `ON CONFLICT DO UPDATE` for accuracy tracking
- **Optimistic in-memory cache** — Zustand holds a hot copy, DB is the source of truth on load

---

## 🛠 Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| Framework | **React Native + Expo** | SDK 56 | iOS + Android from one codebase |
| Navigation | **Expo Router** | 56.2 | File-based routing, typed routes |
| Game renderer | **@shopify/react-native-skia** | 2.6 | Smooth 60fps canvas drawing |
| State management | **Zustand** | 5.0 | Lightweight reactive stores |
| Database | **expo-sqlite** | 56.0 | Bundled, offline, no server |
| Audio | **expo-av** | 16.0 | Cross-platform sound effects |
| Charts | **react-native-chart-kit** | 6.12 | Analytics visualisation |
| Animation | **react-native-reanimated** | 4.3 | Spring animations |
| Typography | **Outfit + JetBrains Mono** | — | Premium feel + monospaced equations |
| Language | **TypeScript** | 6.0 | Full type safety throughout |

---

## 📁 Project Structure

```
mathris/
├── app/                         # Expo Router screens
│   ├── _layout.tsx              # Root layout — boots DB and stores
│   ├── index.tsx                # Main Menu
│   ├── game.tsx                 # Game Screen (core loop)
│   ├── review.tsx               # Post-game wrong-answer review
│   ├── dashboard.tsx            # Parent/Teacher dashboard
│   └── topic-select.tsx         # Practice mode topic picker
│
├── components/
│   ├── GameBoard.tsx            # Skia canvas — grid, bricks, ghost piece
│   ├── Keypad.tsx               # Answer input (supports X=, X=,Y= formats)
│   ├── HUD.tsx                  # Score / level / combo / token display
│   ├── HintModal.tsx            # Bottom-sheet step-by-step hint
│   ├── BrickPreview.tsx         # Next brick preview
│   └── StarRating.tsx           # 1–3 star post-game rating
│
├── engine/
│   ├── engine.ts                # Grid, collision, row-clear, rotation, ghost
│   ├── bricks.ts                # 7 tetrominoes, factory, speed penalty
│   ├── equations.ts             # Generator (Easy/Med/Hard) + validator + hints
│   └── audio.ts                 # expo-av sound controller
│
├── store/
│   ├── gameStore.ts             # Zustand: all real-time game state
│   └── progressStore.ts         # Zustand: XP, mastery, wrong-answer log
│
├── data/
│   ├── repository.ts            # IRepository interface (the swap contract)
│   ├── sqliteRepository.ts      # expo-sqlite implementation
│   ├── repositoryProvider.ts    # Service locator: setRepository/getRepository
│   └── storage.ts               # Deprecation shim (type re-exports only)
│
├── constants/
│   ├── theme.ts                 # Colours, fonts, spacing, shadows
│   └── config.ts                # Grid size, tick rates, scoring, XP
│
└── assets/
    ├── fonts/                   # Outfit, JetBrains Mono (TTF)
    └── sounds/                  # lock, clear, wrong, streak, freeze, hint, gameover
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Expo CLI | Installed via npx |
| Android Studio | For Android emulator |

### Clone & install

```bash
git clone https://github.com/NafisUlAmanSaadman/mathris.git
cd mathris
npm install
```

### Start the development server

```bash
npx expo start
```

This opens the Expo Metro bundler. From here:

| Key | Action |
|---|---|
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator (macOS only) |
| `w` | Open in web browser (limited — no Skia) |

---

## 📱 Running on Android Studio

1. Open **Android Studio** → **Virtual Device Manager**
2. Create or start an emulator (**Pixel 7**, API 34+ recommended)
3. With the emulator running:

```bash
npx expo run:android
```

Expo will build the native Android project via Gradle and install it on the emulator automatically. The first build takes ~3–5 minutes; subsequent builds are incremental.

> **Physical device?** Enable USB debugging, plug in your phone, then run the same command. Expo detects it automatically.

---

## 📊 Parent & Teacher Dashboard

Accessible from the Main Menu → **📊 Dashboard**. No login required — all data is local.

| Panel | What it shows |
|---|---|
| **Overview cards** | Current level, total XP, games played, overall accuracy |
| **🤖 ML Learning Profile** | On-device Logistic Regression SGD model metrics: cross-entropy loss, epochs, total observations, and predicted struggle rates (AI Forecast) |
| **Accuracy by Topic** | Bar chart — how well the player performs per operation type |
| **Recent Scores** | Line chart — score trend across the last 7 sessions |
| **Needs Practice** | Topics with < 70% accuracy, flagged automatically |
| **Wrong Answer History** | Every missed equation with the correct answer shown |

> **For teachers:** Accuracy by Topic maps directly to school curriculum topics — you can see at a glance whether a student struggles with fractions, algebra, or multiplication facts.

---

## 📊 On-Device Adaptive Practice Mode

Mathris includes an adaptive topic selector running completely on-device, utilizing historical practice statistics.

- **Struggle Rates**: It computes actual historical error rates for each math topic using the formula `(attempts - correct) / attempts`.
- **Adaptive Spawning**: When the player enables **"Target Weak Areas (Adaptive)"**, the equation generator utilizes these struggle rates to run a weighted selection (roulette wheel), spawning equation types the player has historically failed or not yet attempted.
- **Diagnostics**: The parent/teacher dashboard displays real-time statistics including total practice attempts, correct answers, overall accuracy, and detailed topic-by-topic struggle rates.

---

## 🎨 Accessibility & Animations

We prioritize visual excellence, smooth performance, and inclusive design:
- **Dyslexia-friendly Font**: Toggling this setting instantly shifts the entire application layout to **OpenDyslexic** (Regular/Bold), designed to improve readability for children with dyslexia.
- **Safe Haptic Feedback**: Integrates subtle native vibrations on keypresses and distinct haptics on correct/wrong answers. Automatically respects user preferences.
- **Main Menu Brick Rain (Skia)**: A beautiful background animation of falling Tetris blocks powered by `@shopify/react-native-skia` running at 60fps on the UI thread.
- **Animated Level-Up Screen**: A full-screen celebration modal built with `react-native-reanimated` using spring physics, rotating neon rings, and floating confetti.

---

## 🎨 Design Principles

These principles shape every decision in Mathris:

1. **Math first, game second** — Every mechanic (freeze, hints, combo) exists to serve the learning goal, not just to be fun.

2. **Mistakes are lessons, not failures** — Wrong answers speed the brick (consequence) but are collected and reviewed after the game (teaching moment). The review screen is framed as *"Let's look at these together"* — never as punishment.

3. **Pressure is controlled** — Freeze tokens and hints exist so children never feel stuck. The goal is productive struggle, not frustration.

4. **Progress is visible** — Stars, XP, level, mastery percentages — children can *see* themselves getting better. This is critical for motivation.

5. **Parents are partners** — The dashboard surfaces exactly what a parent or teacher needs to guide practice. No account required, no data leaves the device.

6. **No dark patterns** — No ads, no loot boxes, no arbitrary paywalls. This is designed to be safe for children.

---

## 🗺 Roadmap

### v2 — Current
- [x] On-Device ML model with SGD for adaptive difficulty
- [x] Animated brick rain on the main menu (Shopify Skia)
- [x] Safe haptic feedback on correct/wrong answers & buttons (expo-haptics)
- [x] Dyslexia-friendly font support (OpenDyslexic)
- [x] Full-screen animated Level-up celebration modal (Reanimated)
- [x] Core Tetris engine and physics
- [x] Easy / Medium / Hard equation generators (with decimal systems in Hard)
- [x] Freeze, Hint, Hot Streak power-ups
- [x] Post-game review screen
- [x] Parent/Teacher dashboard with charts
- [x] Topic Filter / Practice mode
- [x] expo-sqlite persistence with repository pattern
- [x] XP & level progression

### v3 — Future
- [ ] Real sound effects (replace placeholder MP3s)
- [ ] Ghost piece label (show equation on ghost)
- [ ] Daily Challenge — one special puzzle per day
- [ ] Perfect-clear bonus detection
- [ ] Export wrong-answer log to PDF
- [ ] Cloud sync via Supabase (plug in `SupabaseRepository`)
- [ ] Multiplayer head-to-head mode
- [ ] Teacher class dashboard (web app)
- [ ] Localisation (Arabic, French, Spanish)

---

## 🤝 Contributing

Contributions are very welcome! Mathris is open-source and education-focused.

```bash
# Fork the repo, then:
git clone https://github.com/<your-username>/mathris.git
cd mathris
npm install
npx expo start
```

### Good first issues
- Replace placeholder MP3 sound effects with real ones
- Add unit tests for `engine/equations.ts` (pure functions, easy to test)
- Implement `InMemoryRepository` for testing
- Add more equation types to Medium/Hard generators
- Improve ghost piece rendering in `GameBoard.tsx`

### Guidelines
- TypeScript strict mode — no `any`
- All new persistence goes through `IRepository` — never call SQLite directly from components or stores
- Keep the equation engine (`engine/equations.ts`) pure and independently testable
- Follow the existing file/folder structure

---

## 📄 License

MIT © 2026 [NafisUlAmanSaadman](https://github.com/NafisUlAmanSaadman)

---

<div align="center">

Made with ❤️ for students, parents, and teachers everywhere.

**Star ⭐ the repo if Mathris helped you or your students!**

</div>
