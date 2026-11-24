# Changelog

## 2026-11-24

- Added HARI.FLY design tokens, local system-font fallback, and the teal-to-dark menu backdrop.
- Upgraded the menu HUD, hero face, logo, personal-best badge, CTA, cards, and safe-area handling.
- Added menu load stagger, idle loops, face interactions, counter feedback, toast queue, and start countdown.
- Added player flap squash/tilt/trail visuals, score pops, near-miss feedback, and milestone effects.
- Added layered parallax, snow particle layers, wind gusts, map theming, and snowfall obstacles.
- Added the delayed death sequence, dizzy player fall, red flash, screen shake, and bottom-sheet game-over panel.
- Added persistent sound, music, vibration, shake, and reduced-motion settings.
- Added local skins, key unlocks, and midnight-resetting daily missions.
- Added accessibility labels, 48px icon targets, reduced-motion guards, particle fallback, and offline dependency cleanup.
- Removed emoji icons across the interface and replaced them with a shared clay-style SVG icon system.
- Removed difficulty choices from the Maps modal and added Normal, Hard, and Extreme as a centered control below START FLYING.
- Preserved gameplay physics, hitboxes, existing localStorage data, and the Karthik Instagram footer.

## Final QA

- Production build passes.
- Live development server returns HTTP 200.
- No CDN, Google Fonts, fetch, WebSocket, or external app assets are used; the footer Instagram link is the only external navigation.
- No `NaN` or negative-counter handling issues were found in the counter implementation.
- Existing `backup-v1/` remains untouched.
