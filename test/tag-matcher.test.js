const TagMatcher = require('../src/js/lib/data/tag-matcher');
const TagMap = require('../src/js/lib/data/tag-map');

describe('TagMatcher', () => {
  describe('constructor', () => {
    it('creates with valid rules object', () => {
      const matcher = new TagMatcher({ road: 'a', 'road residential': 'b' });
      expect(matcher).toBeInstanceOf(TagMatcher);
    });

    it('throws on invalid tag in rule key', () => {
      expect(() => new TagMatcher({ '1bad': 'x' })).toThrow("Invalid tag '1bad'");
    });

    it('handles empty rules object', () => {
      const matcher = new TagMatcher({});
      expect(matcher).toBeInstanceOf(TagMatcher);
    });

    it('parses priority markers correctly', () => {
      const matcher = new TagMatcher({
        road: 'p0',
        '! road': 'p1',
        '!! road': 'p2',
        '!!! road': 'p3',
      });
      // Higher priority should come first — verified via match behavior
      const map = new TagMap(1, 1);
      map.set(0, 0, 'road');
      expect(matcher.match(map, 0, 0)).toBe('p3');
    });

    it('accepts wildcard *', () => {
      expect(() => new TagMatcher({ '*': 'default' })).not.toThrow();
    });
  });

  describe('rule syntax validation', () => {
    it.each([
      'road',
      'road residential',
      '! road',
      '!! road residential',
      '*',
      '! *',
    ])('accepts valid rule "%s"', (rule) => {
      expect(() => new TagMatcher({ [rule]: 'ok' })).not.toThrow();
    });

    it('rejects invalid tag in rule', () => {
      expect(() => new TagMatcher({ '1invalid': 'x' })).toThrow('Invalid tag');
    });

    it('rejects wildcard mixed with tags', () => {
      expect(() => new TagMatcher({ '* road': 'x' })).toThrow('wildcard');
    });

    it('rejects wildcard mixed with tags (tag first)', () => {
      expect(() => new TagMatcher({ 'road *': 'x' })).toThrow('wildcard');
    });

    it('validates each tag individually in multi-tag rules', () => {
      expect(() => new TagMatcher({ 'road 1bad': 'x' })).toThrow("Invalid tag '1bad'");
    });
  });

  describe('match()', () => {
    it('returns payload for matching single-tag rule', () => {
      const matcher = new TagMatcher({ road: 'road.png' });
      const map = new TagMap(3, 3);
      map.set(1, 1, 'road');
      expect(matcher.match(map, 1, 1)).toBe('road.png');
    });

    it('returns payload for matching multi-tag rule (conjunction)', () => {
      const matcher = new TagMatcher({ 'road residential': 'neighborhood.png' });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'residential');
      expect(matcher.match(map, 0, 0)).toBe('neighborhood.png');
    });

    it('does not match multi-tag rule when only some tags present', () => {
      const matcher = new TagMatcher({ 'road residential': 'neighborhood.png' });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      expect(matcher.match(map, 0, 0)).toBeNull();
    });

    it('returns null when no rule matches', () => {
      const matcher = new TagMatcher({ road: 'road.png' });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'park');
      expect(matcher.match(map, 0, 0)).toBeNull();
    });

    it('returns wildcard payload when no other rule matches', () => {
      const matcher = new TagMatcher({ road: 'road.png', '*': 'default.png' });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'park');
      expect(matcher.match(map, 0, 0)).toBe('default.png');
    });

    it('higher priority rule wins over lower', () => {
      const matcher = new TagMatcher({
        road: 'normal',
        '! road': 'priority',
      });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      expect(matcher.match(map, 0, 0)).toBe('priority');
    });

    it('more specific rule wins over less specific (same priority)', () => {
      const matcher = new TagMatcher({
        road: 'general',
        'road residential': 'specific',
      });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'residential');
      expect(matcher.match(map, 0, 0)).toBe('specific');
    });

    it('insertion order breaks ties (same priority and specificity)', () => {
      const matcher = new TagMatcher({
        road: 'first',
        highway: 'second',
      });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'highway');
      expect(matcher.match(map, 0, 0)).toBe('first');
    });

    it('tag order in rule does not matter', () => {
      const matcher1 = new TagMatcher({ 'a b': 'payload' });
      const matcher2 = new TagMatcher({ 'b a': 'payload' });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'a');
      map.set(0, 0, 'b');
      expect(matcher1.match(map, 0, 0)).toBe('payload');
      expect(matcher2.match(map, 0, 0)).toBe('payload');
    });

    it('wildcard at priority 0 loses to any tag match at priority 0', () => {
      const matcher = new TagMatcher({
        '*': 'default',
        road: 'road.png',
      });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      expect(matcher.match(map, 0, 0)).toBe('road.png');
    });

    it('wildcard matches cells with no tags', () => {
      const matcher = new TagMatcher({ '*': 'default' });
      const map = new TagMap(3, 3);
      expect(matcher.match(map, 0, 0)).toBe('default');
    });

    it('returns null for empty rules', () => {
      const matcher = new TagMatcher({});
      const map = new TagMap(3, 3);
      expect(matcher.match(map, 0, 0)).toBeNull();
    });
  });

  describe('matchAll()', () => {
    it('returns all matching payloads in precedence order', () => {
      const matcher = new TagMatcher({
        road: 'general',
        'road residential': 'specific',
        '*': 'default',
      });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'residential');
      expect(matcher.matchAll(map, 0, 0)).toEqual(['specific', 'general', 'default']);
    });

    it('returns empty array when nothing matches', () => {
      const matcher = new TagMatcher({ road: 'road.png' });
      const map = new TagMap(3, 3);
      expect(matcher.matchAll(map, 0, 0)).toEqual([]);
    });

    it('includes wildcard in results at the end if lowest priority', () => {
      const matcher = new TagMatcher({
        '*': 'default',
        road: 'road.png',
      });
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      const results = matcher.matchAll(map, 0, 0);
      expect(results).toEqual(['road.png', 'default']);
      expect(results[results.length - 1]).toBe('default');
    });

    it('returns only wildcard for untagged cell', () => {
      const matcher = new TagMatcher({
        road: 'road.png',
        '*': 'default',
      });
      const map = new TagMap(3, 3);
      expect(matcher.matchAll(map, 0, 0)).toEqual(['default']);
    });
  });

  describe('integration with TagMap', () => {
    it('works end-to-end with a populated TagMap', () => {
      const map = new TagMap(3, 3);
      map.set(0, 0, 'road');
      map.set(0, 0, 'commercial');
      map.set(1, 0, 'road');
      map.set(1, 0, 'residential');
      map.set(2, 0, 'park');

      const matcher = new TagMatcher({
        '!! road commercial': 'commercial-road.png',
        '! road': 'priority-road.png',
        road: 'road.png',
        'road residential': 'neighborhood.png',
        '*': 'default.png',
      });

      // (0,0) has road + commercial → !! road commercial wins (priority 2)
      expect(matcher.match(map, 0, 0)).toBe('commercial-road.png');

      // (1,0) has road + residential → ! road wins (priority 1, beats road residential at p0)
      expect(matcher.match(map, 1, 0)).toBe('priority-road.png');

      // (2,0) has park → only wildcard matches
      expect(matcher.match(map, 2, 0)).toBe('default.png');

      // (0,1) has no tags → only wildcard matches
      expect(matcher.match(map, 0, 1)).toBe('default.png');

      // matchAll for (1,0): ! road, road residential, road, wildcard
      expect(matcher.matchAll(map, 1, 0)).toEqual([
        'priority-road.png',
        'neighborhood.png',
        'road.png',
        'default.png',
      ]);
    });
  });
});
