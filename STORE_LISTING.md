# Chrome Web Store listing copy

Paste these into the Web Store developer dashboard when publishing the new
"Better Sentence Segmentation" listing.

## Name

Better Sentence Segmentation

## Summary (max 132 characters)

Puts each sentence on its own line so long paragraphs are easier to read. The upgraded successor to Sentence Segmenter.

## Description

Better Sentence Segmentation makes dense webpages easier to read by putting each
sentence on its own line. Starting every sentence at the left margin makes it
faster to reread, skim, and follow sentence structure.

This is the upgraded successor to the original "Sentence Segmenter" extension,
rebuilt from the ground up:

• Smarter sentence detection — it no longer breaks on abbreviations (U.S., Mr.,
  e.g.), numbered lists (1., 10.), or decimals (3.14).
• Instant on/off — turn segmentation off and the page returns to normal
  immediately, with no reload. It works offline, too.
• Safer — it rewrites text only, leaving the page's links, scripts, styles, and
  interactive elements untouched.
• Lighter and modern — Manifest V3, no jQuery.

How to use it:
• Click the toolbar icon and press "Segment This Page", or right-click and choose
  "Segment Complete Page".
• Options in the popup: line separators, double spacing, element borders, and
  auto-segment on page load.
• Turn it off from the popup, or refresh the page.

Original extension (separate listing):
https://chromewebstore.google.com/detail/sentence-segmenter/jfbhkblbhhigbgdnijncccdndhbflcha

The original was commissioned by Jeff Kang.

## Notes for the reviewer

This is a new Manifest V3 extension that succeeds the author's earlier
"Sentence Segmenter" extension (now maintained on a separate account). It only
reads and reformats visible text on the active page when the user triggers it;
it makes no network requests and collects no data. Permissions: "storage" (saves
the user's toggle preferences) and "contextMenus" (the right-click "Segment
Complete Page" item); host access is used solely to inject the content script
that reformats the page.
