'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { findBreakOffsets } = require('../app/scripts/segmenter.js');

// findBreakOffsets returns the offsets (immediately after the boundary
// whitespace) where a sentence break should be inserted. Counting the offsets
// is enough to assert how many breaks happen and where.

function breakCount(text) {
  return findBreakOffsets(text).length;
}

// Returns the substring just before each break, trimmed — handy for asserting
// *which* sentence a break follows.
function sentencesBeforeBreaks(text) {
  return findBreakOffsets(text).map((offset) => text.slice(0, offset).trimEnd());
}

test('breaks between ordinary sentences', () => {
  const text = 'The cat sat. The dog ran.';
  assert.strictEqual(breakCount(text), 1);
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['The cat sat.']);
});

test('does not split the abbreviation U.S. (issue #2)', () => {
  const text = 'The U.S. is big. It grows.';
  // Only one break, after "big." — never inside "U.S."
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['The U.S. is big.']);
});

test('does not split numbered list markers (issue #3)', () => {
  const text = '1. First item. 2. Second item.';
  const breaks = sentencesBeforeBreaks(text);
  // No break may directly follow a "1." / "2." list marker.
  for (const s of breaks) {
    assert.ok(!/\b\d+\.$/.test(s), `unexpected break after list marker: "${s}"`);
  }
});

test('does not split multi-digit list markers (issue #3)', () => {
  const text = '10. Tenth point. Done.';
  const breaks = sentencesBeforeBreaks(text);
  for (const s of breaks) {
    assert.ok(!/\b\d+\.$/.test(s), `unexpected break after list marker: "${s}"`);
  }
});

test('does not split honorific abbreviations', () => {
  const text = 'Mr. Smith went home. He slept.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['Mr. Smith went home.']);
});

test('does not split decimals', () => {
  const text = 'Pi is 3.14 today. Yes.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['Pi is 3.14 today.']);
});

test('does not split e.g.', () => {
  const text = 'Use fruit, e.g. apples and pears. Done.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['Use fruit, e.g. apples and pears.']);
});

test('breaks after question and exclamation marks', () => {
  const text = 'Wait! Really? Yes.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['Wait!', 'Wait! Really?']);
});

test('returns no breaks for a single sentence', () => {
  assert.strictEqual(breakCount('Just one sentence here.'), 0);
});

test('does not break mid-sentence before a lowercase word', () => {
  // A period followed by a lowercase word is treated as an abbreviation, not a boundary.
  assert.strictEqual(breakCount('See sect. four for details.'), 0);
});

test('suppresses titles before a capitalized name', () => {
  const text = 'Col. Mustard and Gen. Lee spoke. Then they left.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['Col. Mustard and Gen. Lee spoke.']);
});

test('suppresses numeric-context abbreviations before a digit', () => {
  // "No." / "Fig." precede numbers, so no break there; the real boundary remains.
  const text = 'See No. 5 and Fig. 3 below. Done.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['See No. 5 and Fig. 3 below.']);
});

test('still breaks when a numeric-context word ends a real sentence', () => {
  // "no" before a capital is the ordinary word, not the abbreviation.
  assert.deepStrictEqual(sentencesBeforeBreaks('I said no. Then I left.'), ['I said no.']);
  // "fig" the fruit must not be mistaken for "Fig." the reference.
  assert.deepStrictEqual(sentencesBeforeBreaks('I ate a fig. Then I left.'), ['I ate a fig.']);
});

test('suppresses month abbreviations before a year', () => {
  const text = 'Born in Jan. 2020 here. Done.';
  assert.deepStrictEqual(sentencesBeforeBreaks(text), ['Born in Jan. 2020 here.']);
});
