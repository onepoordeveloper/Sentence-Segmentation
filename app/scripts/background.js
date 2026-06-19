'use strict';

// MV3 service worker. Settings live in chrome.storage.local and are read
// directly by the popup and content script, so this worker only needs to seed
// defaults, own the context menu, and relay menu clicks to the active tab.

const DEFAULT_SETTINGS = {
  enabled: true,
  autoSegment: true,
  lineSeparator: false,
  doubleSpace: false,
  paraBorder: false,
  ignoredSites: [],
};

const CONTEXT_MENU_ID = 'segmentPage';

chrome.runtime.onInstalled.addListener(() => {
  // Seed any settings that aren't set yet without clobbering existing choices.
  chrome.storage.local.get(DEFAULT_SETTINGS, (current) => {
    chrome.storage.local.set(current);
  });

  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Segment Complete Page',
    contexts: ['page'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { method: 'segmentNow' });
  }
});
