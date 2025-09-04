const EventEmitter = require('events');

class PowerUpStatus {
  constructor(config) {
    this.config = config;
    this.languages = this.config.dashboard.languages;
    [this.mainLanguage] = this.languages;
    this.events = new EventEmitter();

    this.$element = $('<div></div>')
      .addClass('power-up-status');

    this.$powerUpSelection = $('<div></div>')
      .addClass('powerups-selection')
      .appendTo(this.$element);

    this.update([]);
  }

  update(activePowerUps) {
    this.$powerUpSelection.empty();
    if (activePowerUps.length === 0) {
      this.$powerUpSelection.append(
        $('<div></div>').addClass('no-selection')
          .append(
            this.languages.map((lang) => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(this.config.dashboard.powerUps.noneActive.text[lang])
            ))
          )
      );
    } else {
      this.$powerUpSelection.append(
        activePowerUps.map((powerUpId) => this.renderPowerUpThumb(powerUpId))
      );
    }
  }

  renderPowerUpThumb(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append(
            this.languages.map((lang) => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(props.title[lang])
            ))
          ))
        .append($('<button></button>').attr('type', 'button')
          .addClass('btn btn-power-ups-disable')
          .append(
            this.languages.map((lang) => (
              $('<span></span>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(this.config.dashboard.powerUps.disableButton.text[lang])
            ))
          )
          .on('click', () => {
            this.events.emit('disable', powerUpId);
          }))
    );
  }
}

module.exports = PowerUpStatus;
