import { describe, it, expect } from 'vitest';
import { highlightNames, highlightNamesWithAvatars } from './highlightNames';

describe('highlightNames', () => {
  it('wraps known names in <strong> tags', () => {
    const result = highlightNames('Jag gick med mamma');
    expect(result).toContain('<strong>Jag</strong>');
    expect(result).toContain('<strong>mamma</strong>');
  });

  it('is case-insensitive', () => {
    expect(highlightNames('PAPPA och Pappa')).toContain('<strong>PAPPA</strong>');
    expect(highlightNames('PAPPA och Pappa')).toContain('<strong>Pappa</strong>');
  });

  it('does not match partial words', () => {
    const result = highlightNames('Jamaica');
    expect(result).not.toContain('<strong>');
  });

  it('converts newlines to <br>', () => {
    const result = highlightNames('rad 1\nrad 2');
    expect(result).toContain('<br>');
  });

  it('escapes HTML entities', () => {
    const result = highlightNames('<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('highlights all family members', () => {
    const text = 'mamma pappa Olle Ellen mormor morfar farmor farfar';
    const result = highlightNames(text);
    for (const name of ['mamma', 'pappa', 'Olle', 'Ellen', 'mormor', 'morfar', 'farmor', 'farfar']) {
      expect(result).toContain(`<strong>${name}</strong>`);
    }
  });
});

describe('highlightNamesWithAvatars', () => {
  it('adds avatar emojis next to names', () => {
    const result = highlightNamesWithAvatars('mamma och pappa');
    expect(result).toContain('👩');
    expect(result).toContain('👨');
  });

  it('wraps avatars in name-avatar span', () => {
    const result = highlightNamesWithAvatars('Olle');
    expect(result).toContain('class="name-avatar"');
    expect(result).toContain('👦');
  });

  it('escapes HTML entities', () => {
    const result = highlightNamesWithAvatars('mamma & pappa');
    expect(result).toContain('&amp;');
  });
});
