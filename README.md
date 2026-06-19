# Better Sentence Segmentation

The upgraded successor to the original **Sentence Segmenter** extension
([original listing](https://chromewebstore.google.com/detail/sentence-segmenter/jfbhkblbhhigbgdnijncccdndhbflcha)).
Same idea, rebuilt: a Manifest V3 rewrite with smarter sentence detection and instant, reversible segmentation.

Chrome Web Store: _(new listing — link to be added after publishing)_

This extension can help make your text easier to read by putting each sentence of a webpage on a new line (separated based on periods).

## What's new in this version

- **Smarter sentence detection** — no longer splits on abbreviations (`U.S.`, `Mr.`, `e.g.`), numbered lists (`1.`, `10.`), or decimals (`3.14`).
- **Auto-segment by default** — pages segment automatically, including content that loads as you scroll. Turn it off per-site from the popup.
- **Instant on/off** — turning segmentation off clears it immediately, with no page reload (so it works offline too).
- **Safer** — rewrites text only, leaving page scripts, styles, links, and interactive elements untouched.
- **Lighter and modern** — Manifest V3, no jQuery.

If you need to reread, it can be faster to find the beginning of sentences that all start on the left.

Sentence structure can also become clearer.

If you’re skimming, you can abandon a sentence, and quickly find another sentence.

You can activate the segmentation by clicking on the top-right icon, or right-clicking (context menu).

Additional notes:

Segmentation is applied to the page as it currently looks, so on dynamic pages (comment threads, expanders) it's best to expand what you want first, then segment.

You can turn the effect off instantly from the popup (no reload needed), or just refresh the page.

Spacing between sentences is similar to the Microsoft Word setting:
Microsoft Word -> Home -> Paragraph -> Indents and Spacing -> Spacing -> 
Line spacing single 
Before After 6 pt

To create a shortcut that activates the sentence segmenter, go to the extensions page (chrome://extensions/), and click on Keyboard Shortcuts at the bottom.

Commissioned by Jeff Kang.
