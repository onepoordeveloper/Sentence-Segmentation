'use strict';

// Popup controls. Reads and writes chrome.storage.local directly — the content
// script reacts to storage changes, so no background round-trip is needed.

const DEFAULT_SETTINGS = {
  enabled: true,
  autoSegment: true,
  lineSeparator: false,
  doubleSpace: false,
  paraBorder: false,
};

// Checkbox id -> setting key. mainSwitch is inverted: it reads "Turn Off", so a
// checked box means segmentation is disabled.
const TOGGLES = [
  { id: 'mainSwitch', key: 'enabled', invert: true },
  { id: 'autoSegment', key: 'autoSegment', invert: false },
  { id: 'paragraphBorder', key: 'paraBorder', invert: false },
  { id: 'lineSeparator', key: 'lineSeparator', invert: false },
  { id: 'doubleSpace', key: 'doubleSpace', invert: false },
];

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
    for (const { id, key, invert } of TOGGLES) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.checked = invert ? !settings[key] : Boolean(settings[key]);
      el.addEventListener('change', () => {
        const value = invert ? !el.checked : el.checked;
        chrome.storage.local.set({ [key]: value });
      });
    }
  });

  const segmentButton = document.getElementById('segmentThisPage');
  if (segmentButton) {
    segmentButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab && tab.id != null) {
          chrome.tabs.sendMessage(tab.id, { method: 'segmentNow' });
        }
        window.close();
      });
    });
  }

  setupIgnoreControl();
});

// Per-site ignore: adds/removes the active tab's hostname from `ignoredSites`.
function setupIgnoreControl() {
  const checkbox = document.getElementById('ignoreSite');
  const label = document.getElementById('ignoreLabel');
  if (!checkbox) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    let host = '';
    try {
      host = tab && tab.url ? new URL(tab.url).hostname : '';
    } catch (e) {
      host = '';
    }

    // chrome://, about:, extension pages, etc. have no host to ignore.
    if (!host) {
      checkbox.disabled = true;
      if (label) label.textContent = 'Ignore site (unavailable here)';
      return;
    }

    if (label) label.textContent = `Don't auto-segment ${host}`;

    chrome.storage.local.get({ ignoredSites: [] }, ({ ignoredSites }) => {
      checkbox.checked = ignoredSites.includes(host);
      checkbox.addEventListener('change', () => {
        chrome.storage.local.get({ ignoredSites: [] }, (current) => {
          const sites = new Set(current.ignoredSites);
          if (checkbox.checked) {
            sites.add(host);
          } else {
            sites.delete(host);
          }
          chrome.storage.local.set({ ignoredSites: Array.from(sites) });
        });
      });
    });
  });
}
