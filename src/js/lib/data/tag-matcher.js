const TagMap = require('./tag-map');

const PRIORITY_RE = /^(!*)\s*/;

function parseRule(key) {
  const match = key.match(PRIORITY_RE);
  const priority = match[1].length;
  const rest = key.slice(match[0].length).trim();

  if (rest === '*') {
    return { tags: null, priority, wildcard: true };
  }

  const tags = rest.split(/\s+/);

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

class TagMatcher {
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

    this.rules.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.specificity !== a.specificity) return b.specificity - a.specificity;
      return a.index - b.index;
    });
  }

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
