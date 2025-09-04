const mapObject = require('../data/map-object');

class ZoneBalanceView {
  constructor(config, levelDefs) {
    this.config = config;

    this.$element = $('<div></div>')
      .addClass('zone-balance');

    this.levelDefs = levelDefs;
    this.levels = mapObject(this.levelDefs, ([id]) => [id, 0]);

    this.ui = Object.fromEntries(Object.keys(this.levelDefs).map((id) => [id,
      $('<div></div>').addClass(['bar', `bar-${id}`]).append([
        $('<div></div>').addClass('label').text(id[0].toUpperCase()),
        $('<div></div>').addClass('over')
          .append($('<div></div><div></div><div></div>')),
        $('<div></div>').addClass('status'),
        $('<div></div>').addClass('under')
          .append($('<div></div><div></div><div></div>')),
      ])]));

    this.$element.append(Object.values(this.ui));
  }

  static levelAsClass(level) {
    return `${Math.sign(level) >= 0 ? 'p' : 'm'}${Math.abs(level)}`;
  }

  update(stats) {
    Object.entries(this.levelDefs).forEach(([id, variable]) => {
      const level = this.levels[id];
      const diff = stats.get(variable); // `${type}-difference`);
      const currLevel = Math.sign(diff) * (Math.ceil(Math.abs(diff) / 0.25) - 1);
      if (currLevel !== level) {
        const oldClass = ZoneBalanceView.levelAsClass(level);
        const newClass = ZoneBalanceView.levelAsClass(currLevel);
        this.ui[id]
          .removeClass(oldClass)
          .addClass(newClass);

        this.levels[id] = currLevel;
      }
    });
  }
}

module.exports = ZoneBalanceView;
