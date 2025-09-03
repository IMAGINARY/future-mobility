class TileCounterView {
  constructor(config, computedFields = []) {
    this.config = config;

    this.$element = $('<div></div>')
      .addClass('tile-counter');

    this.computedFields = computedFields;

    this.fields = Object.assign(
      Object.fromEntries(
        Object.keys(config.tileTypes).map((id) => [id, $('<span></span>').addClass('field')])
      ),
      Object.fromEntries(
        this.computedFields.map((field) => [field.id, $('<span></span>').addClass('field')])
      )
    );

    this.$element.append(
      $('<ul></ul>')
        .addClass('tile-counter-counts')
        .append(
          Object.keys(config.tileTypes).map((id) => $('<li></li>')
            .append($('<span></span>')
              .addClass('label')
              .html(`${config.tileTypes[id].name || config.tileTypes[id].type || id}: `))
            .append(this.fields[id]))
        )
        .append(
          this.computedFields.map((field) => $('<li></li>')
            .append($('<span></span>')
              .addClass('label')
              .html(`${field.label}: `))
            .append(this.fields[field.id]))
        )
    );
  }

  addComputedField(definition) {
    this.computedFields.push(definition);
  }

  updateTileTypeFields(stats) {
    const total = stats.get('zones-total');
    Object.keys(this.config.tileTypes).forEach((id) => {
      const { type } = this.config.tileTypes[id];
      const count = stats.get(`zones-${type}-count`);
      this.fields[id].text(`${count} (${((count / total) * 100).toFixed(1)}%)`);
    });
  }

  updateComputedFields(stats) {
    this.computedFields.forEach(({ id, calculate }) => {
      this.fields[id].text(calculate(stats));
    });
  }

  update(stats) {
    this.updateTileTypeFields(stats);
    this.updateComputedFields(stats);
  }
}

module.exports = TileCounterView;
