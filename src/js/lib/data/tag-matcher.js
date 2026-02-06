/**
 * @module tag-matcher
 *
 * Provides a rule-matching engine for TagMap grids. Rules are strings
 * (designed to be used as YAML object keys) that describe tag conjunctions
 * with optional priority markers. The matcher resolves which rules apply
 * at a given (x, y) and returns the matching payloads.
 *
 * Rule key format:
 *  [!...] <tags | *>
 * - Priority is indicated by leading '!' characters. More '!' means higher priority.
 * - Tags are space-separated. A rule matches if all tags are present (AND logic).
 * - The wildcard '*' matches any cell regardless of tags.
 *
 * Example rules:
 *  "!! road residential" → priority=2, tags=["residential","road"]
 *  "! *"                 → priority=1, wildcard
 *  "road"                → priority=0, tags=["road"]
 *
 *  Rules are evaluated in order of:
 *  1. Priority (more '!' wins)
 *  2. Specificity (more tags wins)
 *  3. Insertion order (earlier rule wins)
 */

const TagMap = require('./tag-map');

// Captures leading '!' characters (priority markers) from a rule key.
const PRIORITY_RE = /^(!*)\s*/;

/**
 * Parses a rule key string into its components.
 *
 * Format: `[!...] <tags | *>`
 *   - `"!! road residential"` → priority=2, tags=["residential","road"]
 *   - `"! *"`                 → priority=1, wildcard
 *   - `"road"`                → priority=0, tags=["road"]
 *
 * Tags are sorted alphabetically so order in the key doesn't matter.
 *
 * @param {string} key - The rule key string to parse.
 * @returns {{ tags: string[]|null, priority: number, wildcard: boolean }}
 * @throws {Error} If the key contains invalid tags or mixes wildcard with tags.
 */
function parseRule(key) {
  const match = key.match(PRIORITY_RE);
  const priority = match[1].length;
  const rest = key.slice(match[0].length).trim();

  if (rest === '*') {
    return { tags: null, priority, wildcard: true };
  }

  const tags = rest.split(/\s+/);

  // Wildcard must stand alone — "* road" is invalid
  if (tags.some((t) => t === '*')) {
    throw new Error(`Invalid rule '${key}': wildcard '*' cannot be combined with tags`);
  }

  tags.forEach((tag) => {
    if (!TagMap.isValidTag(tag)) {
      throw new Error(`Invalid tag '${tag}' in rule '${key}'`);
    }
  });

  tags.sort();

  return { tags, priority, wildcard: false };
}

/**
 * Evaluates tag-based rules against a TagMap at specific coordinates.
 *
 * Rules are plain objects mapping rule-key strings to arbitrary payloads.
 * A rule matches a cell when all of its tags are present (AND conjunction).
 * The wildcard `"*"` matches any cell regardless of tags.
 *
 * When multiple rules match, precedence is:
 *   1. Priority  — higher `!` count wins
 *   2. Specificity — more tags wins
 *   3. Insertion order — earlier rule wins (tiebreaker)
 *
 * @class
 */
class TagMatcher {
  /**
   * @param {Object<string, *>} rules - Map of rule-key strings to payloads.
   * @throws {Error} If any rule key contains invalid tags.
   */
  constructor(rules) {
    const entries = Object.entries(rules);
    this.rules = entries.map(([key, payload], index) => {
      const parsed = parseRule(key);
      return {
        ...parsed,
        payload,
        specificity: parsed.wildcard ? 0 : parsed.tags.length,
        index,
      };
    });

    // Pre-sort so match() can return on first hit
    this.rules.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.specificity !== a.specificity) return b.specificity - a.specificity;
      return a.index - b.index;
    });
  }

  /**
   * Returns the payload of the highest-precedence matching rule, or null.
   * @param {TagMap} tagMap
   * @param {number} x
   * @param {number} y
   * @returns {*|null}
   */
  match(tagMap, x, y) {
    const cellTags = tagMap.getTags(x, y);

    for (let i = 0; i < this.rules.length; i += 1) {
      const rule = this.rules[i];
      if (rule.wildcard || rule.tags.every((t) => cellTags.includes(t))) {
        return rule.payload;
      }
    }

    return null;
  }

  /**
   * Returns payloads for all matching rules, in precedence order.
   * @param {TagMap} tagMap
   * @param {number} x
   * @param {number} y
   * @returns {Array<*>}
   */
  matchAll(tagMap, x, y) {
    const cellTags = tagMap.getTags(x, y);
    const results = [];

    for (let i = 0; i < this.rules.length; i += 1) {
      const rule = this.rules[i];
      if (rule.wildcard || rule.tags.every((t) => cellTags.includes(t))) {
        results.push(rule.payload);
      }
    }

    return results;
  }
}

module.exports = TagMatcher;
