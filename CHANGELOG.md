# Changelog

All notable changes to SPRING. [Deutsch](CHANGELOG.de.md)

## 2.0.0 (2026-10-04)

The game is now called **SPRING**.

### New
* **7 figures** sorted by difficulty: Cross, Plus, Pyramid, Arrow, Diamond, Fireplace, Classic. Every figure is verified as solvable to a single marble in the centre.
* **Switch figures during play** via the figure name in the header, the Figures button, or the sidebar on iPad in landscape. The board rebuilds itself with an animation.
* **Separate progress per figure**: switching never loses a game.
* **Stars** per figure (up to three) and per figure statistics.
* **Next figure** button on the result card.
* **Hints**: a solver in a Web Worker shows the next correct move.
* **Living rim**: captured marbles and unused marbles lie loose in the rim and react to taps and swipes with physics, collisions and sound.
* **Tilt** (optional): marbles in the rim roll when the device is tilted.
* **New sound design** in four layers (contact, wood, ceramic, room), tuned to a pentatonic scale and rising with progress. Three sound styles: Warm, Clear, Soft.
* **Bilingual**: German on German devices, English everywhere else.
* **Settings sheet** with sound, sound style and tilt.
* One time hint on first launch showing where to change the figure.

### Changed
* All 32 marbles are always present. Marbles a figure does not need rest in the rim.
* Controls: Undo, Hint, New, Figures, More.
* The iPhone respects the silent switch.
* Saved games and statistics from version 1 are carried over automatically.

### Technical
* New modules: `figures.js`, `gutter.js`, `solver.js`, `solver-worker.js`, `tilt.js`, `i18n.js`.
* 26 automated tests, run on every push via GitHub Actions.
* Documentation fully available in German and English.

## 1.0.0 (2026-10-04)

First version, still called Solohalma.

* Classic English board with 33 holes and 32 marbles
* Tap or drag, unlimited undo, rating at the end of a game
* Round dark blue board, captured marbles roll into the rim
* Light and dark mode, portrait and landscape
* Progressive web app, works offline
