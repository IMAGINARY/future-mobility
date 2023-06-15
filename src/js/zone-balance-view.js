class ZoneBalanceView {
  constructor(stats, config) {
    this.stats = stats;
    this.config = config;
    this.stats.events.on("update", this.handleUpdate.bind(this));

    this.$element = $("<div></div>").addClass("zone-balance");

    this.levels = {
      residential: 0,
      //commercial: 0,
      //industrial: 0,
    };

    const tileTypes = Object.keys(this.levels);

    this.ui = Object.fromEntries(
      tileTypes.map((type) => [
        type,
        $("<div></div>")
          .addClass(["bar", `bar-${type}`])
          .append([
            $("<div></div>").addClass("label").text(type[0].toUpperCase()),
            $("<div></div>")
              .addClass("over")
              .append($("<div></div><div></div><div></div>")),
            $("<div></div>").addClass("status"),
            $("<div></div>")
              .addClass("under")
              .append($("<div></div><div></div><div></div>")),
          ]),
      ])
    );

    this.$element.append(Object.values(this.ui));
    this.handleUpdate();
  }

  static levelAsClass(level) {
    return `${Math.sign(level) >= 0 ? "p" : "m"}${Math.abs(level)}`;
  }

  handleUpdate() {
    Object.entries(this.levels).forEach(([type, level]) => {
      const diff = this.stats.get(`${type}-difference`);
      const currLevel =
        Math.sign(diff) * (Math.ceil(Math.abs(diff) / 0.25) - 1);
      if (currLevel !== level) {
        const oldClass = ZoneBalanceView.levelAsClass(level);
        const newClass = ZoneBalanceView.levelAsClass(currLevel);
        this.ui[type].removeClass(oldClass).addClass(newClass);

        this.levels[type] = currLevel;
      }
    });
  }
}

module.exports = ZoneBalanceView;
