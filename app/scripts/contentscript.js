'use strict';

// Content script. Reads settings from chrome.storage.local, applies/clears
// segmentation in place (no page reload), and re-applies live when settings
// change. The actual DOM work lives in segmenter.js (window.Segmenter).

const DEFAULT_SETTINGS = {
  enabled: true,
  autoSegment: true,
  lineSeparator: false,
  doubleSpace: false,
  paraBorder: false,
  ignoredSites: [],
};

function optionsFrom(settings) {
  return {
    lineSeparator: settings.lineSeparator,
    doubleSpace: settings.doubleSpace,
    paraBorder: settings.paraBorder,
  };
}

// True when the user has added this site's hostname to the ignore list.
// Ignored sites are never auto-segmented (manual "Segment This Page" still works).
function isIgnored(settings) {
  return Array.isArray(settings.ignoredSites) &&
    settings.ignoredSites.includes(location.hostname);
}

// ---- Lazy-content observer state ------------------------------------------
// When auto-segment is on, watch for content added after load (infinite scroll,
// AJAX, lazy rendering) and segment just the new subtrees.
const OBSERVER_DEBOUNCE_MS = 400;
let autoObserver = null;
let pendingNodes = [];
let flushTimer = null;

// Run a DOM-mutating segmentation op with the observer paused, so it never
// reacts to the nodes we insert/split (which would double-break content).
function withObserverPaused(fn) {
  const wasObserving = autoObserver !== null;
  if (wasObserving) autoObserver.disconnect();
  try {
    fn();
  } finally {
    if (wasObserving && autoObserver) {
      autoObserver.observe(document.body, { childList: true, subtree: true });
    }
  }
}

function applySegmentation(settings) {
  if (!settings.enabled) return;
  withObserverPaused(() => {
    Segmenter.clear(document.body);
    Segmenter.segment(document.body, optionsFrom(settings));
  });
}

function readSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_SETTINGS, resolve);
  });
}

// Content scripts run at document_end, which is often too early on real pages:
// text may still be rendering, or the page's own load scripts re-render right
// after and wipe the breaks. So auto-segment waits for the load event plus a
// short settle delay, letting late content appear first.
const AUTO_SEGMENT_SETTLE_MS = 1000;

function onMutations(records) {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node.nodeType === 1 && node.classList && node.classList.contains('ss-break')) continue;
      if (node.nodeType === 1 || node.nodeType === 3) pendingNodes.push(node);
    }
  }
  if (pendingNodes.length && flushTimer === null) {
    flushTimer = setTimeout(flushPending, OBSERVER_DEBOUNCE_MS);
  }
}

// Drop nodes contained by another pending node, so a subtree is never segmented
// twice (which would double-break already-processed text).
function topLevelNodes(nodes) {
  return nodes.filter((n) =>
    !nodes.some((other) => other !== n && other.nodeType === 1 && other.contains(n)));
}

function flushPending() {
  flushTimer = null;
  const nodes = topLevelNodes(pendingNodes.filter((n) => n.isConnected));
  pendingNodes = [];
  if (!nodes.length) return;

  readSettings().then((settings) => {
    if (!settings.enabled || !settings.autoSegment || isIgnored(settings)) return;
    const opts = optionsFrom(settings);
    withObserverPaused(() => {
      for (const node of nodes) {
        if (node.isConnected) Segmenter.segmentNode(node, opts);
      }
    });
  });
}

function startAutoObserver() {
  if (autoObserver || !document.body) return;
  autoObserver = new MutationObserver(onMutations);
  autoObserver.observe(document.body, { childList: true, subtree: true });
}

function stopAutoObserver() {
  if (autoObserver) {
    autoObserver.disconnect();
    autoObserver = null;
  }
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  pendingNodes = [];
}

// Start or stop the observer to match the current auto-segment state.
function syncAutoObserver(settings) {
  if (settings.enabled && settings.autoSegment && !isIgnored(settings)) {
    startAutoObserver();
  } else {
    stopAutoObserver();
  }
}

function autoSegmentWhenReady(settings) {
  const run = () => {
    applySegmentation(settings);
    startAutoObserver();
  };
  if (document.readyState === 'complete') {
    setTimeout(run, AUTO_SEGMENT_SETTLE_MS);
  } else {
    window.addEventListener('load', () => setTimeout(run, AUTO_SEGMENT_SETTLE_MS), { once: true });
  }
}

// Auto-segment on load when enabled and the site isn't ignored.
readSettings().then((settings) => {
  if (settings.enabled && settings.autoSegment && !isIgnored(settings)) {
    autoSegmentWhenReady(settings);
  }
});

// Manual trigger from the popup button or the context menu.
chrome.runtime.onMessage.addListener((request) => {
  if (request && request.method === 'segmentNow') {
    readSettings().then((settings) => {
      if (settings.enabled) applySegmentation(settings);
    });
  }
});

// Live updates: re-apply or clear when a setting changes, no reload needed.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;

  readSettings().then((settings) => {
    if (!settings.enabled) {
      stopAutoObserver();
      Segmenter.clear(document.body);
      return;
    }
    // Adding the current site to the ignore list clears it right away; once
    // ignored, nothing is auto-applied here.
    if (isIgnored(settings)) {
      stopAutoObserver();
      if ('ignoredSites' in changes) Segmenter.clear(document.body);
      return;
    }
    // Enabling auto-segment, or un-ignoring this site, segments it now.
    if (('autoSegment' in changes || 'ignoredSites' in changes) && settings.autoSegment) {
      applySegmentation(settings);
    } else if (Segmenter.isSegmented(document.body)) {
      // Appearance settings only matter once the page is already segmented.
      applySegmentation(settings);
    }
    syncAutoObserver(settings);
  });
});
