# PROGRESS

## Code Map
- `index.html` - Vite HTML entry point; loads `/src/main.jsx` and currently links Google Fonts.
- `src/main.jsx`, `src/App.jsx` - React bootstrap and top-level error boundary.
- `src/components/GameView.jsx` - Owns the `GameEngine` instance and switches React UI by game state.
- `src/components/GameCanvas.jsx` - Binds the canvas to the engine and observes container resizing.
- `src/game/engine/GameEngine.js` - Coordinates state, gameplay systems, canvas rendering, audio, input, and persistence.
- `src/game/engine/GameLoop.js` - Single `requestAnimationFrame` loop with pause/resume and delta-time clamping.
- `src/game/state/` and `src/game/systems/` - State machine, events, score, collectibles, input, and particle systems.
- `src/game/physics/`, `collision/`, `obstacles/`, `player/`, `renderer/`, `environment/`, `powerups/` - Gameplay simulation and canvas visuals.
- `src/config/` - Gameplay, audio, map, and mode configuration.
- `src/utils/storage.js` - `SafeStorage` wrapper; handles unavailable/corrupt storage with defaults and in-memory fallback.
- `src/audio/` and `src/hooks/useAudio.js` - Audio playback/settings and React subscription.
- `src/ui/MainMenu.jsx` and `src/ui/*.jsx` - Menu, HUD, settings, mode/song pickers, wheel, and game-over interfaces.
- `src/index.css` - Global and component styling, including reduced-motion rules.
- `src/assets/` plus root `image/`, `music/`, and `public/` - Local game images, maps, and audio managed through `AssetManager`.
- `package.json`, `vite.config.js` - React/Vite app scripts and build configuration.
- Local storage keys found: `hari_fly_coins`, `hari_fly_keys`, `hraifly_high_score`, `hraifly_bgm_vol`, `hraifly_sfx_vol`, `hraifly_audio_mute`, `hraifly_gameplay_music_mode`, `hraifly_favorite_gameplay_track`, `hraifly_game_over_track`, `hari_fly_unlocked_songs`, `selectedMap`, `hraifly_game_mode`, `hari_fly_pilot_username`, `hari_fly_local_leaderboard_records`, `hari_fly_lucky_wheel_last_spin`.
- Risks noticed: the app is React/Vite, not a standalone no-build HTML game; Google Fonts are requested remotely; the canvas uses a 390x844 logical viewport; responsive menu fit at 360x640 needs careful validation; the worktree already contained uncommitted changes before this step.

## Steps
- [x] 0 Audit & Setup
- [x] 1 Tokens, Typography, Background
- [x] 2 Menu Layout Upgrade
- [x] 3 Menu Load Animation & Idle Loops
- [x] 4 Press States, Counters, Toasts
- [x] 5 Hero Interactions
- [x] 6 Start Transition & Menu Pause
- [x] 7 In-Game Juice: Player & HUD
- [x] 8 World: Parallax, Snow, Wind
- [x] 9 Death Sequence & Game Over Panel
- [x] 10 Audio, Haptics, Settings
- [x] 11 Expressions, Skins, Missions
- [x] 12 Accessibility & Performance Pass
- [x] 13 Final QA & Handoff

## Log
- 2026-11-24 - Step 0 complete. Created `backup-v1/` with 101 project files, excluding `.git`, `node_modules`, and generated `dist`; verified the copied file count. Created this code map and step tracker. No game code changed.
- 2026-11-24 - Step 1 complete. Added the HARI.FLY design tokens and system-font fallback to `src/index.css`, replaced the menu gradient/radial background, and removed the Google Fonts network links from `index.html`. No bundled WOFF2 font was available, so the system fallback is used.
- 2026-11-24 - Step 2 complete. Upgraded the menu HUD targets, 96px lime primary CTA, gold personal-best border, 2x2 feature-card grid, and list-card states. Added visually locked, disabled Skins and Missions placeholders with no new gameplay logic.
- 2026-11-24 - Step 3 complete. Added the stagger table, split logo letters, and menu idle animations for the face, CTA, wheel, and music icon. Added the `menu-active` class and reduced-motion coverage; menu elements leave the active menu when gameplay replaces it.
- 2026-11-24 - Step 4 complete. Added visible focus and pressed states, animated coin/key/personal-best counters with bump feedback, tabular-number styling, and a queueing top-center toast system that is ready to call via `showToast(text)`.
- 2026-11-24 - Step 5 complete. Added a tappable hero face with squash/stretch, six temporary particles, click audio/haptic hook, random wiggle timers, and a wheel ready state showing `SPIN!` with gold pulse and periodic wiggle. All timers are cleaned on menu unmount.
- 2026-11-24 - Step 6 complete. Added a 200ms menu fade, 400ms face move, 3-2-1-GO countdown, menu-loop pause class, and cleanup of start timers. The existing engine start behavior and physics remain unchanged.
- 2026-11-24 - Step 7 complete. Added visual player tilt/squash support to image avatars and fallback birds, increased pooled flap trail puffs, kept particles within the existing pool, added score-pop feedback, CLOSE near-miss messaging, and milestone toast/confetti at 10/25/50. Physics, hitboxes, and obstacle logic remain unchanged.
- 2026-11-24 - Step 8 complete. Added separate 0.2x/0.5x/0.8x parallax offsets, two snow particle layers, occasional wind gust strength for snow, snowfall ice obstacles, and per-map CSS theme variables. No collision or obstacle-speed values were changed.
- 2026-11-24 - Step 9 complete. Added an 80ms death freeze, red flash, 8px/250ms screen shake, dizzy player spin/stars, 500ms delayed bottom-sheet reveal, 600ms score count-up, new-best gold burst, and renamed actions to PLAY AGAIN/HOME.
- 2026-11-24 - Step 10 complete. Added persistent Sound, Music, Vibration, Screen shake, and Reduce motion switches in settings. Added guarded vibration helper, existing first-tap AudioContext unlock, and independent storage keys under the existing `hraifly_*` prefix. Reduced-motion preferences now apply a workspace-level CSS class.
- 2026-11-24 - Step 11 complete. Replaced the locked Skins/Missions placeholders with local modals. Added three local skin choices, key-cost unlock logic, selected-skin filter fallback, and a daily two-mission set that resets at local midnight. Existing face-image art remains the graceful expression fallback.
- 2026-11-24 - Step 12 complete. Added HUD icon labels, 48px icon targets, face/list containment, reduced-motion canvas guards, and frame-time fallback that reduces emitted particles when frame time exceeds 20ms. Removed remaining `will-change` declarations. Confirmed there are no CDN/font/fetch calls in the app; only the existing footer Instagram link remains user-triggered external navigation.
- 2026-11-24 - Step 13 complete. Final production build and live HTTP smoke check pass. Added `CHANGELOG.md`. The 360x640, 390x844, and 430x932 layouts are covered by existing responsive CSS and require manual visual confirmation. Saved data and `backup-v1/` remain preserved.

## Notes & Fixes
- 2026-11-24 - Increased and equalized the main-menu coin, key, and lucky-wheel icon graphics to 30px.
- 2026-11-24 - Removed the dark/pill backgrounds from the main-menu coin, key, lucky-wheel, fullscreen/settings, and HUD icon controls. The lucky-wheel button is now 30px to match the wallet height, with no dark timer tile.
- 2026-11-24 - Replaced emoji/Unicode icon glyphs across the game UI with the shared clay-style [ClayIcon.jsx](src/ui/ClayIcon.jsx) SVG set. Covered loading, trophy, skins, missions, modes/weather, leaderboard, lucky wheel, song selection, and pilot registration.
- 2026-11-24 - Fixed a startup regression found after Step 8: `GameEngine` called `this.obstacleManager.setMap(...)` before creating `ObstacleManager`, causing the React ErrorBoundary to replace the game with "Cannot read properties of undefined (reading 'setMap')". The call is now after construction and repeated safely when the selected map changes.
- The design document is `NEW md's/Hari.fly_design.md`; the prompt refers to it as `design.md`. Read the actual file when following steps.
- Existing uncommitted changes were present before Step 0 in `src/components/GameView.jsx`, `src/config/mapConfig.js`, `src/game/engine/GameEngine.js`, `src/game/obstacles/ObstacleManager.js`, `src/game/powerups/PowerUpManager.js`, `src/game/systems/CollectibleManager.js`, `src/index.css`, `src/ui/MainMenu.jsx`, and `src/ui/ModesModal.jsx`. Untracked items included `NEW md's/`, `src/assets/maps-real/`, `src/assets/modes/`, and `src/config/gameModeConfig.js`. These were left untouched and included in the backup where applicable.
- The backup intentionally excludes dependency and generated/build folders; `package-lock.json` is included to restore dependencies if needed.
