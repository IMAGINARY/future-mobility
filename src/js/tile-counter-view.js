const TileCounter = require('./tile-counter');

class TileCounterView {
  constructor(city, config) {
    this.city = city;
    this.config = config;

    this.counter = new TileCounter(city, config);
    this.counter.events.on('update', this.handleUpdate.bind(this));

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

    this.handleUpdate();
  }

  handleUpdate() {
    Object.entries(this.counter.numPerType).forEach(([id, count]) => {
      this.fields[id].text(`${count} (${((count / this.counter.total) * 100).toFixed(1)}%)`);
    });
  }
}

module.exports = TileCounterView;
