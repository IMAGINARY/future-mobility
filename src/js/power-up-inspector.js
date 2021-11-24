const EventEmitter = require('events');

class PowerUpInspector {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.values = Object.fromEntries(Object.keys(config.powerUps).map(id => [id, false]));

    this.$element = $('<div></div>')
      .addClass('power-up-switcher');

    Object.entries(config.powerUps).forEach(([id, def]) => {
      const switchId = `power-up-switch-${id}`;
      $('<div></div>').addClass('form-group form-check')
        .append(
          $('<input type="checkbox">')
            .addClass('form-check-input')
            .attr('id', switchId)
            .on('change', () => {
              this.handleChange(id, $(`#${switchId}`).prop('checked'));
            }),
        )
        .append(
          $('<label></label>').addClass('form-check-label')
            .attr('for', switchId)
            .text(def.title.en)
        )
        .appendTo(this.$element);
    });
  }

  handleChange(id, enabled) {
    this.values[id] = enabled;
    this.events.emit('power-up-change', id, enabled);
  }

  getEnabled() {
    return Object.entries(this.values).filter(([, enabled]) => enabled).map(([id]) => id);
  }
}

module.exports = PowerUpInspector;
