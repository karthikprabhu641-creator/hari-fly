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
- [ ] 4 Press States, Counters, Toasts
- [ ] 5 Hero Interactions
- [ ] 6 Start Transition & Menu Pause
- [ ] 7 In-Game Juice: Player & HUD
- [ ] 8 World: Parallax, Snow, Wind
- [ ] 9 Death Sequence & Game Over Panel
- [ ] 10 Audio, Haptics, Settings
- [ ] 11 Expressions, Skins, Missions
- [ ] 12 Accessibility & Performance Pass
- [ ] 13 Final QA & Handoff

## Log
- 2026-11-24 - Step 0 complete. Created `backup-v1/` with 101 project files, excluding `.git`, `node_modules`, and generated `dist`; verified the copied file count. Created this code map and step tracker. No game code changed.
- 2026-11-24 - Step 1 complete. Added the HARI.FLY design tokens and system-font fallback to `src/index.css`, replaced the menu gradient/radial background, and removed the Google Fonts network links from `index.html`. No bundled WOFF2 font was available, so the system fallback is used.
- 2026-11-24 - Step 2 complete. Upgraded the menu HUD targets, 96px lime primary CTA, gold personal-best border, 2x2 feature-card grid, and list-card states. Added visually locked, disabled Skins and Missions placeholders with no new gameplay logic.
- 2026-11-24 - Step 3 complete. Added the stagger table, split logo letters, and menu idle animations for the face, CTA, wheel, and music icon. Added the `menu-active` class and reduced-motion coverage; menu elements leave the active menu when gameplay replaces it.

## Notes & Fixes
- The design document is `NEW md's/Hari.fly_design.md`; the prompt refers to it as `design.md`. Read the actual file when following steps.
- Existing uncommitted changes were present before Step 0 in `src/components/GameView.jsx`, `src/config/mapConfig.js`, `src/game/engine/GameEngine.js`, `src/game/obstacles/ObstacleManager.js`, `src/game/powerups/PowerUpManager.js`, `src/game/systems/CollectibleManager.js`, `src/index.css`, `src/ui/MainMenu.jsx`, and `src/ui/ModesModal.jsx`. Untracked items included `NEW md's/`, `src/assets/maps-real/`, `src/assets/modes/`, and `src/config/gameModeConfig.js`. These were left untouched and included in the backup where applicable.
- The backup intentionally excludes dependency and generated/build folders; `package-lock.json` is included to restore dependencies if needed.
