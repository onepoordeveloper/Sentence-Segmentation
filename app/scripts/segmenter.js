'use strict';

// Sentence segmenter: pure boundary detection plus reversible DOM rewriting.
//
// Loaded two ways:
//  - as a content script (via manifest), where it defines globals on `window`
//  - in Node (via the test suite), where it exports its pure functions
//
// The pure boundary logic has no DOM dependency so it can be unit-tested.

(function (root) {
  // The abbreviation lists only matter when the next word already looks like a
  // sentence start (capital, digit, or opening quote). A period followed by a
  // lowercase word never breaks, so "etc. and" / "vs. the" need no entry here.

  // Abbreviations safe to suppress even before a CAPITAL ("Mr. Smith"). Kept
  // free of words that collide with everyday English (day names, "no", "in",
  // "fig"…) — those would swallow real breaks like "I sat. The cat…".
  const SAFE_ABBREVIATIONS = new Set([
    // Titles & honorifics
    'mr', 'mrs', 'ms', 'mx', 'dr', 'prof', 'rev', 'fr', 'sr', 'jr', 'st',
    'gen', 'col', 'sgt', 'capt', 'lt', 'cmdr', 'gov', 'sen', 'rep', 'pres',
    'supt', 'hon', 'messrs', 'mt',
    // Latin & scholarly
    'etc', 'eg', 'ie', 'viz', 'cf', 'vs', 'al', 'ca', 'ibid', 'nb', 'qv',
    'sc', 'et', 'ff', 'op',
    // Business & organizations
    'inc', 'ltd', 'co', 'corp', 'llc', 'plc', 'bros', 'mfg', 'assn', 'dept',
    'div', 'univ', 'est', 'approx',
    // Months
    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
  ]);

  // Abbreviations that collide with common words or are normally written before
  // a number. Suppressed ONLY when the next token is a digit ("No. 5", "Fig. 3",
  // "pp. 12") — so "I said no. Then…" and "I ate a fig. Then…" still break.
  const NUMERIC_ABBREVIATIONS = new Set([
    'no', 'nos', 'p', 'pp', 'pg', 'fig', 'figs', 'eq', 'ch', 'sec', 'sect',
    'vol', 'art', 'para', 'ln', 'ref', 'tbl', 'app', 'ver',
  ]);

  // A boundary candidate: sentence punctuation, an optional closing quote/paren,
  // then whitespace. The capture groups let us inspect the punctuation and gap.
  const CANDIDATE = /([.?!])(["'’”)\]]?)(\s+)/g;

  // Letters making up the word immediately before a given index.
  function precedingWord(text, dotIndex) {
    let i = dotIndex - 1;
    let word = '';
    while (i >= 0 && /[A-Za-z]/.test(text[i])) {
      word = text[i] + word;
      i--;
    }
    return word;
  }

  // First non-space character at or after `i` ('' if end of string).
  function nextNonSpace(text, i) {
    while (i < text.length && /\s/.test(text[i])) i++;
    return text[i] || '';
  }

  // A new sentence should look like it starts: uppercase, digit, an opening
  // quote/paren, or the end of the text. A lowercase next word signals an
  // abbreviation or mid-sentence period, so we don't break there.
  function looksLikeSentenceStart(ch) {
    return ch === '' || /[A-Z0-9"'“‘([]/.test(ch);
  }

  /**
   * Offsets (just past the boundary whitespace) where a line break belongs.
   * @param {string} text
   * @returns {number[]}
   */
  function findBreakOffsets(text) {
    if (typeof text !== 'string' || text.length === 0) return [];

    const offsets = [];
    CANDIDATE.lastIndex = 0;
    let match;

    while ((match = CANDIDATE.exec(text)) !== null) {
      const punctuation = match[1];
      const dotIndex = match.index; // position of the punctuation char
      const breakAt = match.index + match[0].length; // just past the whitespace

      if (!looksLikeSentenceStart(nextNonSpace(text, breakAt))) continue;

      if (punctuation === '.') {
        const charBefore = text[dotIndex - 1] || '';
        if (/[0-9]/.test(charBefore)) continue; // list markers, decimals

        const word = precedingWord(text, dotIndex).toLowerCase();
        if (word.length === 1) continue; // initials: U.S., e.g.
        if (SAFE_ABBREVIATIONS.has(word)) continue;
        // Numeric-context abbreviations only suppress before a digit.
        if (NUMERIC_ABBREVIATIONS.has(word) && /[0-9]/.test(nextNonSpace(text, breakAt))) {
          continue;
        }
      }

      offsets.push(breakAt);
    }

    return offsets;
  }

  // --- DOM segmentation (browser only) -------------------------------------

  const BREAK_CLASS = 'ss-break';
  const SEPARATOR_CLASS = 'segmentSeparator';
  const BORDER_CLASS = 'ss-bordered';
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'INPUT', 'SELECT', 'NOSCRIPT',
  ]);

  function makeBreakNode(doc, opts) {
    if (opts.doubleSpace) {
      const span = doc.createElement('span');
      span.className = BREAK_CLASS + ' ss-space';
      span.textContent = '  ';
      return span;
    }
    const span = doc.createElement('span');
    span.className = BREAK_CLASS + ' ' + SEPARATOR_CLASS + (opts.lineSeparator ? ' sepBorder' : '');
    return span;
  }

  function isSkippable(node) {
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.classList && el.classList.contains(BREAK_CLASS)) return true;
      if (el.isContentEditable) return true;
    }
    return false;
  }

  function nearestBlock(node) {
    for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
      const display = getComputedStyle(el).display;
      if (display === 'block' || display === 'list-item' || display === 'flex' || display === 'grid') {
        return el;
      }
    }
    return null;
  }

  // Split one text node at its sentence boundaries, inserting break markers.
  function segmentTextNode(node, opts, doc) {
    if (!node.nodeValue || !node.nodeValue.trim()) return;
    if (isSkippable(node)) return;

    const offsets = findBreakOffsets(node.nodeValue);
    if (offsets.length === 0) return;

    const parent = node.parentNode;
    if (!parent) return;

    if (opts.paraBorder) {
      const block = nearestBlock(node);
      if (block) block.classList.add(BORDER_CLASS);
    }

    // Walk offsets back-to-front so earlier indices stay valid as we split.
    let tail = node;
    for (let k = offsets.length - 1; k >= 0; k--) {
      const rest = tail.splitText(offsets[k]); // `rest` starts the next sentence
      parent.insertBefore(makeBreakNode(doc, opts), rest);
    }
  }

  /**
   * Insert reversible sentence breaks into every eligible text node under root.
   * @param {Node} rootEl
   * @param {{lineSeparator?:boolean, doubleSpace?:boolean, paraBorder?:boolean}} options
   */
  function segment(rootEl, options) {
    const opts = options || {};
    const root = rootEl || document.body;
    const doc = root.ownerDocument || document;

    // Collect text nodes first; we mutate the tree as we go.
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (isSkippable(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) textNodes.push(n);

    for (const node of textNodes) segmentTextNode(node, opts, doc);

    if (root.setAttribute) root.setAttribute('data-ss-segmented', 'true');
  }

  /**
   * Segment a single added node (element subtree or text node). Used by the
   * content script's MutationObserver to handle lazy-loaded content.
   * @param {Node} node
   * @param {object} options
   */
  function segmentNode(node, options) {
    if (!node) return;
    const opts = options || {};
    if (node.nodeType === 3) {
      segmentTextNode(node, opts, node.ownerDocument || document);
    } else if (node.nodeType === 1) {
      // Skip our own break markers; otherwise segment the whole subtree.
      if (node.classList && node.classList.contains(BREAK_CLASS)) return;
      // Idempotent: a re-inserted subtree may already hold breaks — clear them
      // first so we re-segment cleanly instead of doubling them.
      clear(node);
      segment(node, opts);
    }
  }

  /**
   * Remove every inserted break and restore the original text flow.
   * @param {Node} rootEl
   */
  function clear(rootEl) {
    const root = rootEl || document.body;
    root.querySelectorAll('.' + BREAK_CLASS).forEach((el) => el.remove());
    root.querySelectorAll('.' + BORDER_CLASS).forEach((el) => el.classList.remove(BORDER_CLASS));
    root.normalize(); // merge the text nodes we split apart
    root.removeAttribute && root.removeAttribute('data-ss-segmented');
  }

  function isSegmented(rootEl) {
    const root = rootEl || document.body;
    return root.getAttribute && root.getAttribute('data-ss-segmented') === 'true';
  }

  const api = {
    findBreakOffsets, segment, segmentNode, clear, isSegmented,
    SAFE_ABBREVIATIONS, NUMERIC_ABBREVIATIONS,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Segmenter = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
