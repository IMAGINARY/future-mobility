const TagMap = require('../src/js/lib/data/tag-map');

describe('TagMap', () => {
  describe('constructor', () => {
    it('creates with valid dimensions', () => {
      const map = new TagMap(3, 4);
      expect(map.width).toBe(3);
      expect(map.height).toBe(4);
    });

    it('initializes all cells with empty arrays', () => {
      const map = new TagMap(2, 2);
      for (let x = 0; x < 2; x += 1) {
        for (let y = 0; y < 2; y += 1) {
          expect(map.getTags(x, y)).toEqual([]);
        }
      }
    });

    it('throws on zero width', () => {
      expect(() => new TagMap(0, 1)).toThrow();
    });

    it('throws on zero height', () => {
      expect(() => new TagMap(1, 0)).toThrow();
    });

    it('throws on negative dimensions', () => {
      expect(() => new TagMap(-1, 5)).toThrow();
      expect(() => new TagMap(5, -1)).toThrow();
    });
  });

  describe('isValidTag', () => {
    it.each([
      'road', '_private', '-custom', '--mod', 'my-tag', 'a1', 'A',
    ])('accepts valid tag "%s"', (tag) => {
      expect(TagMap.isValidTag(tag)).toBe(true);
    });

    it.each([
      ['1start', 'starts with digit'],
      ['-1bad', 'hyphen followed by digit'],
      ['', 'empty string'],
      ['has space', 'contains space'],
      ['no.dots', 'contains dot'],
      ['-', 'lone hyphen'],
    ])('rejects invalid tag "%s" (%s)', (tag) => {
      expect(TagMap.isValidTag(tag)).toBe(false);
    });

    it('rejects non-string values', () => {
      expect(TagMap.isValidTag(42)).toBe(false);
      expect(TagMap.isValidTag(null)).toBe(false);
      expect(TagMap.isValidTag(undefined)).toBe(false);
    });
  });

  describe('set()', () => {
    it('sets a tag and verifies with has()', () => {
      const map = new TagMap(3, 3);
      map.set(1, 2, 'road');
      expect(map.has(1, 2, 'road')).toBe(true);
    });

    it('is idempotent — setting same tag twice does not duplicate', () => {
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'road');
      expect(map.getTags(0, 0)).toEqual(['road']);
    });

    it('supports multiple different tags on the same cell', () => {
      const map = new TagMap(3, 3);
      map.set(1, 1, 'road');
      map.set(1, 1, 'highway');
      map.set(1, 1, 'lit');
      expect(map.getTags(1, 1)).toEqual(['road', 'highway', 'lit']);
    });

    it('throws on invalid tag', () => {
      const map = new TagMap(3, 3);
      expect(() => map.set(0, 0, '1start')).toThrow('Invalid tag');
    });

    it('throws on out-of-bounds coordinates', () => {
      const map = new TagMap(3, 3);
      expect(() => map.set(-1, 0, 'road')).toThrow('out of bounds');
      expect(() => map.set(0, -1, 'road')).toThrow('out of bounds');
      expect(() => map.set(3, 0, 'road')).toThrow('out of bounds');
      expect(() => map.set(0, 3, 'road')).toThrow('out of bounds');
    });
  });

  describe('has()', () => {
    it('returns true for a set tag', () => {
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      expect(map.has(0, 0, 'road')).toBe(true);
    });

    it('returns false for an unset tag', () => {
      const map = new TagMap(3, 3);
      expect(map.has(0, 0, 'road')).toBe(false);
    });

    it('throws on out-of-bounds coordinates', () => {
      const map = new TagMap(3, 3);
      expect(() => map.has(-1, 0, 'road')).toThrow('out of bounds');
      expect(() => map.has(3, 0, 'road')).toThrow('out of bounds');
    });
  });

  describe('getTags()', () => {
    it('returns empty array initially', () => {
      const map = new TagMap(3, 3);
      expect(map.getTags(0, 0)).toEqual([]);
    });

    it('returns all set tags', () => {
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'lit');
      expect(map.getTags(0, 0)).toEqual(['road', 'lit']);
    });

    it('returns a copy — modifying it does not affect the TagMap', () => {
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      const tags = map.getTags(0, 0);
      tags.push('hacked');
      expect(map.getTags(0, 0)).toEqual(['road']);
    });

    it('throws on out-of-bounds coordinates', () => {
      const map = new TagMap(3, 3);
      expect(() => map.getTags(-1, 0)).toThrow('out of bounds');
      expect(() => map.getTags(0, 3)).toThrow('out of bounds');
    });
  });

  describe('toCompact()', () => {
    it('returns empty tags and indices for an empty map', () => {
      const map = new TagMap(2, 2);
      const { tags, indices } = map.toCompact();
      expect(tags).toEqual([]);
      for (let y = 0; y < 2; y += 1) {
        for (let x = 0; x < 2; x += 1) {
          expect(indices[y][x]).toEqual([]);
        }
      }
    });

    it('handles a single-cell single-tag map', () => {
      const map = new TagMap(1, 1);
      map.set(0, 0, 'road');
      const { tags, indices } = map.toCompact();
      expect(tags).toEqual(['road']);
      expect(indices[0][0]).toEqual([0]);
    });

    it('deduplicates shared tags across cells', () => {
      const map = new TagMap(2, 1);
      map.set(0, 0, 'road');
      map.set(0, 0, 'lit');
      map.set(1, 0, 'road');
      map.set(1, 0, 'park');
      const { tags, indices } = map.toCompact();
      expect(tags).toContain('road');
      expect(tags).toContain('lit');
      expect(tags).toContain('park');
      expect(new Set(tags).size).toBe(tags.length);
      // Verify indices map back correctly
      const cell0 = indices[0][0].map((i) => tags[i]);
      const cell1 = indices[0][1].map((i) => tags[i]);
      expect(cell0).toEqual(['road', 'lit']);
      expect(cell1).toEqual(['road', 'park']);
    });

    it('produces no duplicate entries in tags array', () => {
      const map = new TagMap(3, 3);
      for (let x = 0; x < 3; x += 1) {
        for (let y = 0; y < 3; y += 1) {
          map.set(x, y, 'shared');
        }
      }
      const { tags } = map.toCompact();
      expect(tags).toEqual(['shared']);
    });

    it('cells with no tags produce empty index arrays', () => {
      const map = new TagMap(2, 2);
      map.set(0, 0, 'road');
      const { indices } = map.toCompact();
      expect(indices[0][1]).toEqual([]);
      expect(indices[1][0]).toEqual([]);
      expect(indices[1][1]).toEqual([]);
    });
  });

  describe('fromCompact()', () => {
    it('round-trips through toCompact and fromCompact', () => {
      const original = new TagMap(3, 2);
      original.set(0, 0, 'road');
      original.set(0, 0, 'lit');
      original.set(1, 0, 'park');
      original.set(2, 1, 'road');
      original.set(2, 1, 'residential');

      const { tags, indices } = original.toCompact();
      const restored = TagMap.fromCompact(3, 2, tags, indices);

      expect(restored.width).toBe(3);
      expect(restored.height).toBe(2);
      for (let x = 0; x < 3; x += 1) {
        for (let y = 0; y < 2; y += 1) {
          expect(restored.getTags(x, y)).toEqual(original.getTags(x, y));
        }
      }
    });

    it('reconstructs an empty compact representation', () => {
      const map = new TagMap(2, 2);
      const { tags, indices } = map.toCompact();
      const restored = TagMap.fromCompact(2, 2, tags, indices);
      for (let x = 0; x < 2; x += 1) {
        for (let y = 0; y < 2; y += 1) {
          expect(restored.getTags(x, y)).toEqual([]);
        }
      }
    });

    it('reconstructs a 1x1 grid', () => {
      const map = new TagMap(1, 1);
      map.set(0, 0, 'solo');
      const { tags, indices } = map.toCompact();
      const restored = TagMap.fromCompact(1, 1, tags, indices);
      expect(restored.getTags(0, 0)).toEqual(['solo']);
    });

    it('handles all cells sharing the same tags', () => {
      const map = new TagMap(2, 2);
      for (let x = 0; x < 2; x += 1) {
        for (let y = 0; y < 2; y += 1) {
          map.set(x, y, 'shared');
          map.set(x, y, 'common');
        }
      }
      const { tags, indices } = map.toCompact();
      const restored = TagMap.fromCompact(2, 2, tags, indices);
      for (let x = 0; x < 2; x += 1) {
        for (let y = 0; y < 2; y += 1) {
          expect(restored.getTags(x, y)).toEqual(['shared', 'common']);
        }
      }
    });
  });

  describe('clear()', () => {
    it('removes all tags from all cells', () => {
      const map = new TagMap(2, 2);
      map.set(0, 0, 'road');
      map.set(1, 1, 'park');
      map.clear();
      expect(map.getTags(0, 0)).toEqual([]);
      expect(map.getTags(1, 1)).toEqual([]);
    });

    it('allows setting tags again after clear', () => {
      const map = new TagMap(2, 2);
      map.set(0, 0, 'road');
      map.clear();
      map.set(0, 0, 'park');
      expect(map.has(0, 0, 'park')).toBe(true);
      expect(map.has(0, 0, 'road')).toBe(false);
    });
  });
});
