const EventEmitter = require('events');
const City = require('../city');
const ModalPowerUp = require('./modal-power-up');

class PowerUpPanel {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.activePowerUps = [];
    this.lastActivePowerUps = [];
    this.$element = $('<div></div>').addClass('power-up-panel');

    this.statusElement = $('<div></div>')
      .addClass('powerups-selection')
      .appendTo(this.$element);

    this.selectButton = $('<button></button>')
      .attr('type', 'button')
      .addClass('btn btn-block btn-dashboard-action btn-power-ups-activate')
      .append($('<span></span>').addClass('text text-de')
        .html(this.config.dashboard.powerUps.button.text.de))
      .append($('<span></span>').addClass('text text-en')
        .html(this.config.dashboard.powerUps.button.text.en))
      .on('click', () => {
        this.openSelector(this.pickSelectablePowerUps());
      })
      .appendTo(this.$element);

    this.update([]);
  }

  updateSelectButton() {
    if (this.activePowerUps.length >= 2) {
      this.disableSelectButton();
    } else {
      this.enableSelectButton();
    }
  }

  disableSelectButton() {
    this.selectButton.attr('disabled', true);
    this.selectButton.addClass('disabled');
  }

  enableSelectButton() {
    this.selectButton.attr('disabled', false);
    this.selectButton.removeClass('disabled');
  }

  update(activePowerUps) {
    this.lastActivePowerUps
      .push(...this.activePowerUps.filter(id => !activePowerUps.includes(id)));
    this.lastActivePowerUps = this.lastActivePowerUps.slice(-2);
    this.activePowerUps = activePowerUps;

    this.statusElement.empty();
    if (activePowerUps.length === 0) {
      this.statusElement.append(
        $('<div></div>').addClass('no-selection')
          .append($('<div></div>').addClass('text text-de')
            .text('Keine Power-Ups aktiv'))
          .append($('<div></div>').addClass('text text-en')
            .text('No Power-Ups active'))
      );
    } else {
      this.statusElement.append(
        activePowerUps.map(powerUpId => this.renderPowerUpThumb(powerUpId))
      );
    }

    this.updateSelectButton();
  }

  pickSelectablePowerUps() {
    return Object.keys(this.config.powerUps)
      .filter(id => !(this.config.powerUps[id].enabled === false))
      .filter(id => !(this.activePowerUps.includes(id)))
      .map(id => [id, (this.lastActivePowerUps.includes(id) ? 1 : 0) + Math.random()])
      .sort(([, recentA], [, recentB]) => recentA - recentB)
      .map(([id]) => id)
      .slice(0, 3);
  }

  renderPowerUpThumb(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append($('<div></div>').addClass('text-de text-main')
            .html(props.title.de))
          .append($('<div></div>').addClass('text-en text-translation')
            .html(props.title.en)))
        .append($('<button></button>').attr('type', 'button')
          .addClass('btn btn-block btn-power-ups-disable')
          .append($('<span></span>').addClass('text text-de text-main').text('Deaktivieren'))
          .append($('<span></span>').addClass('text text-en text-translation').text('Disable'))
          .on('click', () => {
            this.events.emit('disable', powerUpId);
            this.activePowerUps = this.activePowerUps.filter(id => id !== powerUpId);
            this.update(this.activePowerUps);
          }))
    );
  }

  openSelector(selectablePowerUps) {
    const modal = new ModalPowerUp(this.config, selectablePowerUps);
    modal.show().then((powerUpId) => {
      if (powerUpId) {
        this.events.emit('enable', powerUpId);
        this.activePowerUps.push(powerUpId);
        this.update(this.activePowerUps);
      }
    });
  }
}

module.exports = PowerUpPanel;
