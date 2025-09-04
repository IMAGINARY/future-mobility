const EventEmitter = require('events');
const { bindCreateTitle } = require('./titles');

class PowerUpSelector {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.activePowerUps = [];
    this.lastActivePowerUps = [];
    this.languages = this.config.dashboard.languages;
    [this.mainLanguage] = this.languages;
    const createTitle = bindCreateTitle(this.languages);
    const cancelText = this.config.dashboard.powerUps.cancelButton.text;

    this.optionContainers = [];
    for (let i = 0; i < 3; i += 1) {
      this.optionContainers.push($('<div></div>').addClass('powerup-container'));
    }

    this.$element = $('<div></div>')
      .addClass('powerups-selector')
      .append(
        $('<div></div>')
          .addClass(['container-fluid', 'h-100'])
          .append(
            $('<div></div>')
              .addClass(['row', 'h-82'])
              .append(
                $('<div></div>')
                  .addClass(['col', 'h-100', 'powerups-selector-main'])
                  .append(createTitle(this.config.dashboard.powerUps.title))
                  .append($('<div></div>').addClass('row')
                    .append(this.optionContainers.map((container) => (
                      $('<div></div>').addClass('col-md-4 h-100 col-powerup-selector-item')
                        .append(container)))))
              )
          )
          .append(
            $('<div></div>')
              .addClass(['row', 'h-18', 'justify-content-end'])
              .append(
                $('<div></div>')
                  .addClass(['col-3', 'powerups-selector-bottom', 'd-grid', 'gap-2'])
                  .append(
                    $('<button></button>')
                      .attr('type', 'button')
                      .addClass('btn btn-block btn-dashboard-action btn-cancel')
                      .append(
                        this.languages.map((lang) => (
                          $('<span></span>')
                            .addClass(`text text-${lang}`)
                            .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                            .html(lang === this.mainLanguage
                              ? `<span class='large'>${cancelText[lang]}</span>`
                              : cancelText[lang])
                        ))
                      )
                      .on('click', () => {
                        this.events.emit('cancel');
                      })
                  )
              )
          )
      );

    this.update([]);
  }

  getActivePowerUps() {
    return this.activePowerUps;
  }

  setSelectablePowerUps(powerUpIds) {
    this.optionContainers.forEach((container, i) => {
      $(container).empty();
      if (powerUpIds[i] !== undefined) {
        $(container).append(this.renderPowerUp(powerUpIds[i]));
      }
    });
  }

  pickSelectablePowerUps() {
    const { hideLastActive } = this.config.dashboard.powerUps.selector;

    return Object.keys(this.config.powerUps)
      .filter((id) => !(this.config.powerUps[id].enabled === false))
      .filter((id) => !(this.activePowerUps.includes(id)))
      .map((id) => [
        id,
        (hideLastActive && this.lastActivePowerUps.includes(id) ? 1 : 0) + Math.random(),
      ])
      .sort(([, recentA], [, recentB]) => recentA - recentB)
      .map(([id]) => id)
      .slice(0, 3);
  }

  makePowerUpSelection() {
    this.setSelectablePowerUps(this.pickSelectablePowerUps());
  }

  renderPowerUp(powerUpId) {
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
        .append($('<div></div>').addClass('image')
          .attr('style', `background-image: url('static/powerups/${powerUpId}.svg')`))
        .append($('<div></div>').addClass('description')
          .append(
            this.languages.map((lang) => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(props.description[lang])
            ))
          ))
        .on('click', () => {
          this.events.emit('select', powerUpId);
        })
    );
  }

  update(activePowerUps) {
    this.lastActivePowerUps
      .push(...this.activePowerUps.filter((id) => !activePowerUps.includes(id)));
    this.lastActivePowerUps = this.lastActivePowerUps.slice(-2);
    this.activePowerUps = activePowerUps;
  }
}

module.exports = PowerUpSelector;
