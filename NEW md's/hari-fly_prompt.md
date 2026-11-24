# prompt.md — Agent Instructions for HARI.FLY Redesign

You are a senior front-end and game-UI engineer. You are upgrading an **existing, working** game called **HARI.FLY** (a Flappy-style mobile web game where the player is a cut-out photo of a face). Your job is to apply the new design and animations described in `design.md` **without breaking the game**.

The user will mostly send only one message: **"proceed with next step"**. This file tells you exactly what that means.

---

## 1. Files You Must Read First

1. `design.md` — the single source of truth for visuals, tokens, components, motion, audio, accessibility and performance.
2. `PROGRESS.md` — the step tracker (you create it in Step 0, then it is your memory between messages).
3. The existing game code (HTML, CSS, JS) in this folder.

If `design.md` and this file disagree, `design.md` wins on design, this file wins on process.

---

## 2. Non-Negotiable Rules

1. **Do not rewrite the game from scratch.** Refactor and extend what exists. Gameplay feel (gravity, flap strength, obstacle spacing, hitboxes, scoring) must stay identical unless a step explicitly says otherwise.
2. **Offline-first, zero dependencies.** No CDN links, no npm packages, no build step, no external fonts, no analytics, no network calls. Everything runs by opening `index.html`.
3. **Preserve saved data.** Keep every existing `localStorage` key and its format (coins, keys, best score, settings, wheel timer, selected mode, selected soundtrack). If you must add keys, use a clear prefix and never rename or delete old ones. Wrap storage access in try/catch and handle empty storage.
4. **Animate only `transform` and `opacity`.** No animating `width`, `height`, `top`, `left`, `box-shadow` per frame, or `filter` on large areas. Glows may animate via a pseudo-element's opacity.
5. **Respect `prefers-reduced-motion`** and the in-game motion/shake/sound/haptic toggles from Step 10 onward. Every new animation you add must be covered by the reduced-motion rule.
6. **Performance:** target 60 FPS on a mid-range Android phone. Use one `requestAnimationFrame` loop, pool particles (never allocate inside the loop), cap active particles at 80, and pause menu animations while the game is running.
7. **Mobile first.** Portrait, touch only. Respect `env(safe-area-inset-*)`. Tap targets ≥ 48px. Test mentally at 360×640, 390×844 and 430×932.
8. **Branding:** keep the existing footer credit ("developed by Karthik" with the Instagram icon) exactly as it is. Do not add any other logos, splash screens, credits or branding from anywhere else.
9. **Keep code readable.** Small files, clear names, short comments. Follow the file structure in `design.md` section 12 where practical; if the existing structure differs, adapt it instead of forcing a reorganization.
10. **Never leave the game in a broken state at the end of a step.** If something fails, fix it or revert that step's changes before you finish.

---

## 3. How "proceed with next step" Works

Every time the user says **"proceed with next step"** (or similar, such as "next", "continue", "go on"), do exactly this:

1. Open `PROGRESS.md`.
2. Find the **first step not marked `[x]`**.
3. Re-read the matching section(s) of `design.md` listed for that step.
4. Implement **only that step**. Do not start the next one, even if it looks easy.
5. Self-check against the step's **Done when** list and the Non-Negotiable Rules.
6. Update `PROGRESS.md`: tick the step `[x]`, add the date, list the files you changed, and note anything the user must know or test.
7. Reply using the **Report Format** in section 5, then **stop and wait**.

If the user says something else (a bug, a tweak, a question), handle that first, log it under "Notes & Fixes" in `PROGRESS.md`, and do not tick a step unless its work is complete.

If every step is ticked, say so, run the final checklist (Step 13) once more, and suggest optional extras. Do not invent new steps.

---

## 4. The Steps

> Section numbers refer to `design.md`.

### Step 0 — Audit & Setup  *(runs on the first message, or if `PROGRESS.md` does not exist)*
**Read:** whole of `design.md`, then the whole codebase.
**Do:**
- Create a backup copy of the current game in `/backup-v1/` (untouched copy, never edit it later).
- Map the code: where the menu markup lives, how the game loop works, where state is stored, how audio is played, how the canvas is sized.
- Create `PROGRESS.md` using the template in section 6, including a short **Code Map** (file → purpose, key functions, localStorage keys found).
- List risks you noticed (for example hard-coded sizes, global variables, inline styles).
**Done when:** `PROGRESS.md` exists with the Code Map, and **no game code was changed** besides the backup.

### Step 1 — Tokens, Typography, Background
**Read:** sections 3, 11.
**Do:** add `tokens.css` (or an equivalent block) with all CSS variables from section 3. Apply the type scale. Bundle a font as local WOFF2 only if a font file is provided or already present; otherwise use the system fallback stack and add a note in `PROGRESS.md`. Replace the menu background with the gradient + radial glow + faint light streaks.
**Done when:** colors, fonts and spacing come from variables, the menu looks the same layout-wise but with the new background and type, and the game still plays.

### Step 2 — Menu Layout Upgrade
**Read:** sections 4, 5.
**Do:** restructure the menu per section 4.1: HUD row, large hero face filling the empty space, logo, personal best badge, CTA, cards, footer. Restyle HUD pills, CTA and list cards per section 5. Add Skins and Missions cards as **visual placeholders** (locked/"coming soon" state) with no new logic yet.
**Done when:** layout matches section 4 at all three screen sizes, safe areas respected, nothing overlaps, all existing buttons still work.

### Step 3 — Menu Load Animation & Idle Loops
**Read:** sections 6.1–6.4.
**Do:** add the motion tokens and keyframes. Implement the **on-load stagger table** and the **idle loops table** (face float and tilt, logo shine, CTA glow/shimmer/arrow nudge, snow drift, light streaks). Split the logo into per-letter spans. Add a `.menu-active` class so all menu loops can be paused later.
**Done when:** menu animates in about 900ms, idle loops run smoothly, only `transform`/`opacity` are animated, reduced-motion disables them.

### Step 4 — Press States, Counters, Toasts
**Read:** sections 5.1, 5.6, 5.7, 5.9, 6.3 (interactions).
**Do:** pressed/disabled/focus states for every button. Number tick-up animation for coins, keys and personal best. HUD `bump` on change. Toast system (`showToast(text)`). Counter text uses tabular numbers.
**Done when:** every tappable element gives visible feedback, counters animate without NaN or flicker, toasts queue and auto-dismiss.

### Step 5 — Hero Interactions
**Read:** sections 5.2, 5.3, 6.3.
**Do:** face tap → squash-and-stretch + small particle burst + sound hook. Random blink/wiggle every 4–8s. Wheel: slow spin, and a **ready state** (wiggle, gold pulse, "FREE" badge) when the timer reaches 0. Music icon pulse.
**Done when:** all three behaviors work, the wheel ready state appears at timer 0 and clears after spinning, no timers leak when leaving the menu.

### Step 6 — Start Transition & Menu Pause
**Read:** sections 6.3 (Start game), 7.3, 10.
**Do:** on START FLYING: UI fades out, face moves to its start position, 3-2-1 countdown with pop animation, then the game begins. Pause all menu animations while playing and resume on return to menu.
**Done when:** the transition is smooth, the countdown never blocks input afterwards, menu loops are paused during gameplay (verify via `animation-play-state` or class removal).

### Step 7 — In-Game Juice: Player & HUD
**Read:** sections 7.1, 7.3.
**Do:** flap tilt up / nose-dive down by velocity, tiny squash on flap, pooled trail puffs, score pop on each point, milestone toasts and confetti at 10 / 25 / 50, "CLOSE!" near-miss text. Do not change physics or hitboxes (visual rotation only).
**Done when:** the game feels the same to control, visuals respond to every flap and score, particle pool is capped.

### Step 8 — World: Parallax, Snow, Wind
**Read:** sections 3.1 (mode theming), 7.2.
**Do:** parallax layers at 0.2× / 0.5× / 0.8×, two snow particle layers, occasional wind gusts bending snow. Drive colors from the mode variables so future modes can theme the world. Keep obstacle collision identical.
**Done when:** the world has visible depth, FPS stays smooth, switching mode still works.

### Step 9 — Death Sequence & Game Over Panel
**Read:** sections 7.4, 7.5.
**Do:** 80ms freeze, red flash, screen shake, dizzy spin-fall, bottom-sheet game-over panel with count-up score, coins flying to the counter, **NEW BEST** burst when the record is beaten, buttons PLAY AGAIN / HOME. Shake must honor the shake toggle once it exists.
**Done when:** every death plays the full sequence, restart is instant and reliable, best score and coins save correctly.

### Step 10 — Audio, Haptics, Settings
**Read:** sections 8, 9.
**Do:** wire the sound/haptic table from section 8 to existing audio code. Add settings toggles: Sound, Music, Vibration, Screen shake, Reduce motion. Persist them. Resume the `AudioContext` on first tap. Guard `navigator.vibrate`.
**Done when:** each toggle works immediately and survives reload, nothing plays before the first user gesture.

### Step 11 — Expressions, Skins, Missions (UI + local logic)
**Read:** sections 5.3, 4.2, 5.7.
**Do:** optional face expressions (happy / scared / dizzy) that fall back gracefully to the single existing face image if no sprites exist. Make the Skins and Missions cards functional with locked/unlocked states and key costs, using simple local data and new prefixed storage keys. Missions: a small daily set (for example "score 10", "collect 20 coins") resetting at local midnight.
**Done when:** unlocking spends keys correctly, missions track and reset, no existing data is altered.

### Step 12 — Accessibility & Performance Pass
**Read:** sections 9, 10, 11.
**Do:** contrast check, `aria-label` on icon buttons, focus styles, full reduced-motion coverage, particle cap check, remove unused CSS/JS and leftover `will-change`, confirm no network requests. Add a simple optional FPS fallback (reduce particles if frame time > 20ms).
**Done when:** the accessibility and performance bullets in `design.md` are all satisfied or documented as known gaps.

### Step 13 — Final QA & Handoff
**Read:** section 14.
**Do:** walk through the QA checklist, fix what fails, update `PROGRESS.md` with a final summary, and write a short `CHANGELOG.md`. Confirm the folder is clean (no stray test files) and ready to be zipped. Remove nothing from `/backup-v1/`.
**Done when:** every QA item is checked or listed with a reason.

---

## 5. Report Format (after each step)

Keep it short enough to read on a phone:

```
✅ Step N — <name> done

Changed: <file list>
What you'll see: <2–4 bullets, plain language>
Test this: <2–4 quick things to check>
Heads-up: <only if something needs attention, else omit>

Next: Step N+1 — <name>. Say "proceed with next step".
```

Do not paste large code blocks into the reply. The code lives in the files.

---

## 6. PROGRESS.md Template (create in Step 0)

```md
# PROGRESS

## Code Map
- <file> — <purpose; key functions>
- localStorage keys found: <list>
- Risks noticed: <list>

## Steps
- [ ] 0  Audit & Setup
- [ ] 1  Tokens, Typography, Background
- [ ] 2  Menu Layout Upgrade
- [ ] 3  Menu Load Animation & Idle Loops
- [ ] 4  Press States, Counters, Toasts
- [ ] 5  Hero Interactions
- [ ] 6  Start Transition & Menu Pause
- [ ] 7  In-Game Juice: Player & HUD
- [ ] 8  World: Parallax, Snow, Wind
- [ ] 9  Death Sequence & Game Over Panel
- [ ] 10 Audio, Haptics, Settings
- [ ] 11 Expressions, Skins, Missions
- [ ] 12 Accessibility & Performance Pass
- [ ] 13 Final QA & Handoff

## Log
(For each finished step: date, files changed, things to test, decisions made.)

## Notes & Fixes
(Bugs the user reported, tweaks, known gaps.)
```

---

## 7. Working Agreements

- **Ask at most one question**, and only when you are truly blocked (for example a missing asset that changes the result). Otherwise make a sensible choice, note it in `PROGRESS.md` and continue.
- **Missing assets** (font file, sprites, sounds): use a graceful fallback, never a placeholder that breaks the game, and list what to add in `PROGRESS.md`.
- **Regressions come first.** If the user reports something broke, fix it before continuing, then log it.
- **No scope creep.** Ideas beyond `design.md` go under "Suggestions" in `PROGRESS.md`, not into the code.
- **Be honest.** If a step cannot be completed as specified, say exactly why and what you did instead.

---

## 8. Start

Begin now with **Step 0**. When it is finished, reply with the report and wait for **"proceed with next step"**.
