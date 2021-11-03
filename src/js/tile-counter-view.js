class TileCounterView {
  constructor(stats, config) {
    this.stats = stats;
    this.config = config;

    this.stats.events.on('update', this.handleUpdate.bind(this));

    this.$element = $('<div></div>')
      .addClass('tile-counter');

    this.fields = Object.fromEntries(
      Object.keys(config.tileTypes).map(id => [id, $('<span></span>').addClass('field')])
    );

    this.$element.append(
      $('<ul></ul>')
        .addClass('tile-counter-counts')
        .append(
          Object.keys(config.tileTypes).map(id => $('<li></li>')
            .append($('<span></span>')
              .addClass('label')
              .html(`${config.tileTypes[id].name || config.tileTypes[id].type || id}: `))
            .append(this.fields[id]))
        )
    );

    this.total = this.stats.get('zones-total');

    this.handleUpdate();
  }

  handleUpdate() {
    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      const count = this.stats.get(`zones-${type}-count`);
      this.fields[id].text(`${count} (${((count / this.total) * 100).toFixed(1)}%)`);
    });
  }
}

module.exports = TileCounterView;
