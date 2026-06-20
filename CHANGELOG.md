# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project follows
[Semantic Versioning](https://semver.org/).

## [2.0.2] - 2026-06-20

### Fixed
- Content scripts now shut down quietly when the extension context is
  invalidated (extension reloaded, updated, or disabled) instead of throwing
  "Extension context invalidated" in already-open tabs.
- High-churn pages (streaming consoles, live feeds) no longer hit the O(n²)
  mutation-dedup path; the dedup is skipped for large batches since per-node
  segmentation is idempotent.

## [2.0.1] - 2026-06-20

### Added
- App icon set (16/48/128) plus an SVG source, wired into the manifest.

## [2.0.0] - 2026-06-20

Relaunched as **Better Sentence Segmentation** — a Manifest V3, jQuery-free,
cross-browser rewrite (successor to the original Sentence Segmenter listing).

### Added
- Text-node segmentation engine with smarter sentence boundaries: skips
  abbreviations (`U.S.`, `Mr.`, `e.g.`), numbered lists (`1.`, `10.`), and
  decimals (`3.14`). Fully reversible with no page reload.
- Auto-segment on load (default on) plus a debounced `MutationObserver` that
  segments lazy / infinite-scroll content.
- Per-site ignore list, managed from the popup.
- Node unit tests, a headless DOM fixture, and a cross-browser build script
  (`build.mjs`) that emits clean per-store Chrome and Firefox packages.

### Changed
- Settings are booleans in `chrome.storage.local`; popup and content script
  react via `storage.onChanged` with no reloads.
- Background reduced to a lifecycle-safe service worker / event page.

### Removed
- Vendored jQuery and the separate options page.
