# HARI.FLY — Design System & Motion Spec

Version 2.0 · Mobile-first (portrait) · Offline-first, no backend, no build step

---

## 1. Product Snapshot

A one-tap, Flappy-style arcade game where the player character is a **cut-out photo of a friend's face**. The face is the hero and the unique selling point. Everything in the UI exists to make that face feel alive, funny and collectible.

**Core loop:** Tap to flap → dodge obstacles → score → earn coins/keys → unlock skins, modes, soundtracks → beat personal best.

**Tone:** Cheeky, loud, friendly. Arcade energy with a calm, snowy night-time backdrop.

---

## 2. Design Principles

1. **Face first.** The face is the largest, most animated element on every screen.
2. **One thumb.** Every primary action sits in the bottom 60% of the screen.
3. **Juice over chrome.** Feedback (squash, shake, burst, sound, haptic) beats extra UI.
4. **Always moving, never noisy.** Idle motion is slow and subtle; action motion is fast and punchy.
5. **Offline and light.** No CDN, no external fonts, no libraries. Only `transform` and `opacity` animate.
6. **Respect the player.** `prefers-reduced-motion` and in-game toggles for sound, haptics and motion.

---

## 3. Design Tokens

### 3.1 Color

```css
:root {
  /* Backgrounds */
  --bg-0: #07141a;          /* deepest, bottom of screen */
  --bg-1: #0c2a2a;          /* teal-green glow behind the face */
  --bg-2: #0f1b2d;          /* card surface */
  --bg-3: #14233a;          /* raised surface / pressed card */

  /* Brand */
  --lime-400: #b6f23a;      /* CTA highlight */
  --lime-500: #8fe01f;      /* CTA base */
  --lime-600: #5fa811;      /* CTA shadow end */
  --white: #ffffff;
  --ink: #0a1a05;           /* text on lime */

  /* Accents */
  --gold: #ffc21a;          /* coins, trophy, personal best */
  --gold-dim: #8a6a12;      /* gold borders */
  --cyan: #2bb5f0;          /* modes */
  --purple: #b57bff;        /* soundtrack */
  --pink: #ff5fa2;          /* music icon, hearts, danger-fun */
  --red: #ff4d4d;           /* death flash */

  /* Neutrals */
  --text-1: #ffffff;
  --text-2: #b8c4cc;
  --text-3: #6f8088;
  --stroke: rgba(255, 255, 255, 0.08);
  --stroke-strong: rgba(255, 255, 255, 0.16);

  /* Glows */
  --glow-lime: 0 0 32px rgba(143, 224, 31, 0.45);
  --glow-gold: 0 0 20px rgba(255, 194, 26, 0.35);
}
```

**Background:** vertical gradient `--bg-1` (top) → `--bg-0` (bottom), with a soft radial glow of `rgba(60, 200, 150, 0.18)` centered behind the face. Faint diagonal light streaks at 8% opacity.

**Per-mode theming:** each mode overrides `--bg-0/1`, accent and particle type. Menu and HUD recolor automatically through CSS variables.

| Mode | Backdrop | Particles | Accent |
|---|---|---|---|
| Snowfall | Night teal | Snow | `--cyan` |
| Sunset (idea) | Orange → purple | Dust / birds | `--gold` |
| Neon (idea) | Black + magenta | Sparks | `--pink` |

### 3.2 Typography

Use a bundled **WOFF2** (self-hosted, subset to Latin) so the game works offline. Recommended: a geometric rounded sans in bold/extra-bold (Outfit, Poppins or similar). Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.

| Token | Size | Weight | Use |
|---|---|---|---|
| `--fs-display` | 64–72px | 800 | Logo "HARI.FLY", big score |
| `--fs-title` | 28px | 800 | Button label, panel titles |
| `--fs-card` | 26px | 800 | Card heading (MODES) |
| `--fs-sub` | 22px | 700 | Card subtitle (current value) |
| `--fs-hud` | 22px | 700 | Coin / key counts |
| `--fs-label` | 14px | 600 | Footer, hints, small labels |

Rules: uppercase for buttons and headings, letter-spacing `0.02em`, tabular numbers (`font-variant-numeric: tabular-nums`) for every counter and timer.

### 3.3 Spacing, Radius, Elevation

```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;

  --radius-sm: 14px;   /* HUD pills */
  --radius-md: 22px;   /* cards */
  --radius-lg: 32px;   /* CTA, panels */
  --radius-pill: 999px;

  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow-cta: 0 10px 0 var(--lime-600), 0 18px 40px rgba(143, 224, 31, 0.35);
}
```

Screen padding: **24px** sides, respect `env(safe-area-inset-*)`.

### 3.4 Z-index

`bg 0` · `particles 1` · `face 5` · `ui 10` · `hud 20` · `modal 50` · `toast 60` · `fx-overlay 90` (flash, transitions)

---

## 4. Menu Screen

### 4.1 Layout (top → bottom)

1. **HUD row:** coins pill, keys pill, wheel button with timer (center-left), fullscreen + settings icon buttons (right).
2. **Hero zone (flex-grow):** the face, centered, large (min 45% of screen width, up to 60%). This fills the currently empty space.
3. **Logo:** `HARI.FLY` with "HARI" in white gradient, "." in cyan, "FLY" in lime gradient.
4. **Personal best badge:** gold-outlined pill, trophy icon + label + large number.
5. **Primary CTA:** full-width lime button, "START FLYING »".
6. **Secondary cards:** Modes, Soundtrack, plus new Skins and Missions (2×2 grid or stacked, see below).
7. **Footer:** "developed by Karthik" pill with Instagram icon, pinned to the bottom safe area.

### 4.2 Proposed additions

- **Skins & Missions row** under Modes/Soundtrack: two half-width cards with locked/unlocked states.
- **Daily tip / challenge strip** above the CTA (one line, dismissible).
- **Keys** show a small tooltip on tap: "Unlock skins and modes".

---

## 5. Components

### 5.1 HUD Pill (coins, keys)

- Height 56px, radius `--radius-sm`, background `--bg-2`, 1.5px `--stroke-strong` border.
- Icon 28px, number 22px bold, tabular.
- **States:** default · `bump` (value changed: scale 1 → 1.2 → 1, number ticks) · `insufficient` (shake + red border).

### 5.2 Wheel Button

- 56px circle, gold ring, spoked wheel icon, timer pill below (`HH:MM:SS`, gold text on dark).
- **Idle:** slow rotation (18s per turn). **Ready (timer 0):** shaking wiggle every 3s, pulsing gold ring, "FREE" badge, timer replaced by "SPIN!".

### 5.3 Hero Face

- Cut-out PNG/WebP with transparent background. Soft drop shadow (`drop-shadow(0 12px 18px rgba(0,0,0,.45))`).
- **Idle:** float + tilt loop. **Tap:** squash-and-stretch + sound + small particle burst.
- **Edge cleanup:** feather 1–2px alpha to hide rough cut-outs.
- **Expressions:** `neutral`, `happy`, `scared`, `dizzy` (optional per-skin sprites).

### 5.4 Logo

- Letters are individual spans so they can animate separately.
- Gradient text via `background-clip: text`. Subtle text-shadow for depth.

### 5.5 Personal Best Badge

- Pill, 2px `--gold-dim` border, dark fill, trophy emoji/SVG at left, "PERSONAL BEST" in gold, number in white 56px.
- On new record: number turns gold and bursts.

### 5.6 Primary Button (CTA)

- Height 96px, radius `--radius-lg`, gradient `--lime-400 → --lime-600`, text `--ink`.
- Top highlight (inset white 40%), bottom 10px "extruded" shadow for a physical feel.
- **Pressed:** translateY(6px), shadow shrinks, scale 0.97.
- **Disabled/loading:** desaturate 60%.

### 5.7 List Card (Modes, Soundtrack, Skins, Missions)

- Height 112px, radius `--radius-md`, surface `--bg-2`, 1.5px border tinted by accent (cyan, purple).
- Left: 64px rounded-square icon tile in accent at 20% fill. Center: heading (white) + current value (accent). Right: chevron.
- **Pressed:** background `--bg-3`, scale 0.98, chevron nudges right 4px.
- **Locked:** 50% opacity, lock icon, key cost chip.

### 5.8 Modals / Pickers

Bottom sheet, radius 32px top corners, drag handle, dimmed backdrop (`rgba(0,0,0,.6)` + 4px blur if performance allows).

### 5.9 Toasts

Top-center pill, auto-dismiss 2s, slide-down + fade. Used for "+10 coins", "Daily reward ready", "New skin unlocked".

---

## 6. Motion System

### 6.1 Principles

- **Idle = slow (3–8s loops), tiny amplitude.** Action = fast (80–300ms), bigger amplitude.
- Animate only `transform` and `opacity`. Use `will-change` sparingly and remove after.
- Never animate more than ~6 things at once on the menu.

### 6.2 Easing & Duration Tokens

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* overshoot */
  --ease-snap: cubic-bezier(0.2, 0, 0, 1);

  --dur-instant: 80ms;
  --dur-fast: 160ms;
  --dur-base: 280ms;
  --dur-slow: 500ms;
  --dur-loop: 4000ms;
}
```

### 6.3 Menu Choreography

**On load (stagger, total ~900ms):**

| Order | Element | Animation | Delay | Duration |
|---|---|---|---|---|
| 1 | HUD pills | slide down + fade | 0ms | 300ms |
| 2 | Face | scale 0.6 → 1 with spring | 100ms | 500ms |
| 3 | Logo letters | drop + bounce, 40ms apart | 250ms | 400ms each |
| 4 | Personal best | fade up, number counts up | 500ms | 600ms |
| 5 | CTA | slide up + spring | 600ms | 450ms |
| 6 | Cards | slide up, 80ms apart | 700ms | 400ms |

**Idle loops:**

| Element | Loop |
|---|---|
| Face | float ±10px, tilt ±3°, 4s ease-in-out |
| Face blink/wiggle | random every 4–8s |
| Logo | shine sweep every 5s |
| CTA | glow breathe 2.4s, shimmer sweep every 4s, `»` nudge 1.2s |
| Wheel | slow spin 18s (or wiggle when ready) |
| Music icon | pulse at ~1.0s (or sync to BPM) |
| Background | snow drift, light streaks |

**Interactions:**

| Trigger | Response |
|---|---|
| Tap face | squash (scaleX 1.15, scaleY 0.85) → stretch → settle, sound, 6 particles |
| Press CTA | scale .97, translateY 6px, haptic 10ms |
| Counter change | number tick + pill bump |
| Card press | scale .98, chevron slides |
| Start game | UI fades out 200ms → face moves to start position 400ms → 3-2-1 countdown |

### 6.4 Core Keyframes

```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-12px) rotate(3deg); }
}

@keyframes breathe-glow {
  0%, 100% { box-shadow: var(--shadow-cta), 0 0 0 rgba(143,224,31,0); }
  50%      { box-shadow: var(--shadow-cta), 0 0 36px rgba(143,224,31,.55); }
}

@keyframes shimmer {
  from { transform: translateX(-120%) skewX(-20deg); }
  to   { transform: translateX(220%)  skewX(-20deg); }
}

@keyframes nudge {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(6px); }
}

@keyframes drop-in {
  0%   { transform: translateY(-60px); opacity: 0; }
  70%  { transform: translateY(6px);   opacity: 1; }
  100% { transform: translateY(0); }
}

@keyframes squash {
  0%   { transform: scale(1, 1); }
  30%  { transform: scale(1.18, 0.82); }
  60%  { transform: scale(0.92, 1.08); }
  100% { transform: scale(1, 1); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-14deg); }
  40% { transform: rotate(12deg); }
  60% { transform: rotate(-8deg); }
  80% { transform: rotate(6deg); }
}

@keyframes pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}
```

---

## 7. Gameplay Visuals

### 7.1 Player (Face)

- **Rotation:** flap → rotate to −25° (80ms); falling → ease toward +70° based on velocity.
- **Scale:** tiny squash on flap (1.05 × 0.95).
- **Trail:** 6–10 pooled puffs behind the face, fade and shrink over 400ms.
- **Expression swap:** happy on score, scared when within 80px of an obstacle, dizzy on death.

### 7.2 World

- **Parallax layers:** far mountains 0.2×, mid hills 0.5×, near trees 0.8×, obstacles 1×.
- **Snow:** two particle layers (small slow, large fast), wind gust events that bend direction for 1–2s.
- **Obstacle style:** match mode (ice pillars for Snowfall) with highlight edge and soft shadow.

### 7.3 HUD In-Game

- Score centered at top, 72px white with dark stroke, **pop** on each point.
- Coin counter top-left, pause top-right. Hidden during countdown.
- Milestone toasts: "NICE!" (10), "WOW!" (25), "LEGEND!" (50), with confetti.
- **Near-miss:** "CLOSE!" flash text at the obstacle gap.

### 7.4 Death Sequence

1. 80ms freeze frame.
2. Red flash overlay (`--red` at 25%, 150ms).
3. Screen shake (8px, 250ms).
4. Face spins and falls with dizzy stars.
5. 500ms later, the game-over panel slides up.

### 7.5 Game Over Panel

- Bottom sheet with score (count-up 600ms), best score, coins earned (fly into HUD).
- **New best:** gold burst, number turns gold, trophy bounces, confetti.
- Buttons: **PLAY AGAIN** (lime, primary), **HOME** (ghost), **WATCH/REVIVE** with key cost (optional).

---

## 8. Audio & Haptics

| Event | Sound | Haptic |
|---|---|---|
| Button tap | short soft click | 5ms |
| Flap | whoosh | none (too frequent) |
| Score | pop/ding, pitch rises with streak | none |
| Coin pickup | coin chime | 8ms |
| Death | funny thud/bonk | 40ms |
| New best | fanfare | 20-40-20ms |
| Wheel tick | tick per segment | 5ms |

- Preload sounds as base64 or local files. Resume `AudioContext` on first tap.
- Soundtrack selector previews 5s on tap, ducks during SFX.
- Respect Settings toggles for music, SFX and haptics (`navigator.vibrate` guarded).

---

## 9. Accessibility

- Contrast: body text on dark ≥ 4.5:1; lime-on-ink CTA ≥ 7:1.
- Tap targets ≥ 48×48px; 8px minimum gap.
- `prefers-reduced-motion`: disable float, shimmer, shake, parallax, confetti; keep fades under 150ms.
- Settings toggle: **Reduce motion**, **Screen shake**, **Vibration**, **Sound**, **Music**.
- Never rely on color alone: icons accompany every state (lock, check, warning).
- Provide `aria-label` on icon buttons (fullscreen, settings, wheel).

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Performance Budget

- 60 FPS on mid-range Android; fall back to 30 FPS particles if frame time > 20ms.
- Max 80 active particles. Use object pooling, never allocate in the game loop.
- Menu animations pause when the game starts (`animation-play-state: paused` or remove class).
- Use a single `requestAnimationFrame` loop; draw the game on one `<canvas>`, keep UI in DOM.
- Images: face as WebP ≤ 150KB, sprites in one atlas, audio ≤ 300KB each.
- Use `contain: layout paint` on animated containers.

---

## 11. Offline-First Constraints

- No external fonts, CDNs, analytics or APIs. Everything ships in the folder/ZIP.
- Persist with `localStorage` (coins, keys, best, settings, wheel timestamp). Wrap in try/catch and handle empty/blocked storage.
- Optional PWA: `manifest.json` + service worker caching all assets for install-to-home-screen.
- User face upload stays on-device (FileReader → canvas crop → store as data URL / IndexedDB).

---

## 12. Suggested File Structure

```
hari-fly/
├── index.html
├── design.md
├── css/
│   ├── tokens.css        /* variables from section 3 */
│   ├── base.css
│   ├── menu.css
│   ├── motion.css        /* keyframes from section 6 */
│   └── game-ui.css
├── js/
│   ├── main.js
│   ├── game.js           /* loop, physics, collisions */
│   ├── fx.js             /* particles, shake, confetti */
│   ├── audio.js
│   ├── storage.js
│   └── ui.js             /* counters, toasts, sheets */
├── assets/
│   ├── faces/
│   ├── sprites/
│   ├── audio/
│   └── fonts/
└── manifest.json
```

---

## 13. Implementation Order

1. Tokens + typography + background gradient.
2. Menu layout upgrade (bigger face, spacing, new cards).
3. Menu load stagger + idle loops (section 6.3).
4. Press states, counters, toasts.
5. In-game flap tilt, trail, score pop.
6. Death sequence + game-over panel + new-best burst.
7. Sound + haptics + settings toggles.
8. Face expressions, custom face upload, skins.
9. Daily missions, wheel-ready state, leaderboard of friends.
10. Reduced-motion and performance pass.

---

## 14. QA Checklist

- [ ] Menu looks right on 360×640, 390×844 and 430×932.
- [ ] Notch / safe-area padding respected in fullscreen.
- [ ] All animations stop under reduced-motion.
- [ ] No jank during the first 3 seconds after load.
- [ ] Counters never show NaN or negative values.
- [ ] Empty `localStorage` produces a clean first-run state.
- [ ] Audio starts only after the first user gesture.
- [ ] Every tappable element has pressed, disabled and focus states.
- [ ] Game runs fully offline after first load.

---

*Footer credit stays as is: "developed by Karthik" with Instagram link, bottom-center.*
