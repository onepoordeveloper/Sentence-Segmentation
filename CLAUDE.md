# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Manifest V3 Chrome extension that rewrites a webpage so each sentence starts on its own line, making dense paragraphs easier to read and skim. The user triggers segmentation from the toolbar icon, the right-click context menu, or automatically on page load. Being relaunched on the Chrome Web Store as "Better Sentence Segmentation" (the original listing, "Sentence Segmenter", is on a separate account).

## Development

The `app/` directory *is* the unpacked extension — no bundler. `app/manifest.json` is a **cross-browser superset**: it carries both the Chrome (`background.service_worker`) and Firefox (`background.scripts` + `browser_specific_settings.gecko`) keys so the unpacked `app/` loads directly in either browser during development.

- **Load/run (Chrome)**: `chrome://extensions` → Developer mode → "Load unpacked" → select `app/`.
- **Load/run (Firefox)**: `about:debugging` → This Firefox → "Load Temporary Add-on" → select `app/manifest.json`.
- **Iterate**: edit files under `app/`, reload the extension; content-script changes also need the target page reloaded.
- **Tests**: `node --test test/segmenter.test.js` (built-in Node test runner, no deps). Boundary logic lives in `app/scripts/segmenter.js` as a pure, Node-importable module; `test/fixture.html` is a headless-Chrome DOM/reversibility harness.
- **Package for the stores**: `node build.mjs` writes clean, per-store manifests + zips to `dist/` (gitignored). `build.mjs` strips each browser's unwanted manifest keys from the superset — Chrome loses `browser_specific_settings`/`background.scripts`, Firefox loses `background.service_worker` (and `key`/`update_url` if present).

## Architecture

Storage-driven, message-light. Settings live in `chrome.storage.local` as **booleans** (`enabled`, `autoSegment`, `lineSeparator`, `doubleSpace`, `paraBorder`) plus `ignoredSites` (array of hostnames). The popup and content script read/write storage directly; the content script reacts to `chrome.storage.onChanged` and applies/clears segmentation **in place with no page reload**.

- **`app/scripts/segmenter.js`** — the engine, no dependencies. `findBreakOffsets(text)` is a **pure** function (Node-importable, unit-tested) deciding where sentence breaks go. `segment(root, opts)` walks **text nodes** via `TreeWalker` (skipping `SCRIPT/STYLE/PRE/CODE/TEXTAREA/INPUT/SELECT` and contenteditable), splitting them and inserting marker nodes (`.ss-break`). `clear(root)` removes those nodes and `normalize()`s, making segmentation fully reversible. Exposes `window.Segmenter` in the page; exports via `module.exports` in Node.
- **`app/scripts/contentscript.js`** — vanilla. Reads settings on load and auto-segments (after `load` + a 1000ms settle delay) when `enabled && autoSegment && !isIgnored`. Re-applies/clears on `storage.onChanged`, and handles a `segmentNow` message for the popup button / context menu (manual works even on ignored sites).
- **`app/scripts/popup.js`** (`popup.html`) — vanilla. Toggle checkboxes map to storage booleans (`mainSwitch` is inverted: "Turn Off"). The per-site ignore checkbox reads the active tab's hostname and adds/removes it in `ignoredSites`.
- **`app/scripts/background.js`** — MV3 service worker / Firefox event page. Only seeds defaults + creates the context menu on install, and relays the menu click to the active tab via `chrome.tabs.sendMessage`. No cached state (lifecycle-safe under both browsers).

### How segmentation works

Sentence boundaries are detected per text node by `findBreakOffsets`: a `[.?!]` (plus optional closing quote/paren) before whitespace, but **not** when the next char isn't sentence-start-like, when a `.` follows a digit (lists/decimals), a single-letter initial (`U.S.`), or a known abbreviation. `SAFE_ABBREVIATIONS` suppress before a capital; `NUMERIC_ABBREVIATIONS` suppress only before a digit (`No. 5`). Inserted markers are styled in `app/styles/main.css` (`.segmentSeparator`, `.sepBorder`, `.ss-bordered`). Because only text nodes are touched, page scripts, styles, attributes, and event listeners are left intact.

## Conventions

- Settings are **booleans** in `chrome.storage.local`; `ignoredSites` is an array of exact hostnames. No reloads on change — the content script reacts via `storage.onChanged`.
- Adding a setting touches: the `DEFAULT_SETTINGS` seed in `background.js`, the same default in `contentscript.js` (and its `onChanged`/apply logic), and a control in `popup.html` + its entry in the `TOGGLES` table in `popup.js`.
- `app/manifest.json` is a **cross-browser superset**; never hand-edit per-store manifests — change the superset and run `node build.mjs`.
- Boundary logic is the part most prone to regressions: add cases to `test/segmenter.test.js` (and the headless `test/fixture.html`) when changing it.
