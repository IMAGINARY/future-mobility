const EventEmitter = require('events');
const { bindCreateTitle } = require('./titles');

class PowerUpSelector {
  constructor(config, buttonContainer, statusContainer, selectionPageContainer) {
    this.config = config;
    this.selectorTimeout = null;
    this.events = new EventEmitter();
    this.activePowerUps = [];
    this.lastActivePowerUps = [];
    this.languages = this.config.dashboard.languages;
    this.mainLanguage = this.languages[0];
    const createTitle = bindCreateTitle(this.languages);


    this.selectButton = $('<button></button>')
      .attr('type', 'button')
      .addClass('btn btn-block btn-dashboard-action btn-power-ups-activate')
      .append(this.languages.map(lang => (
          $('<span></span>')
            .addClass(`text text-${lang}`)
            .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
            .html(this.config.dashboard.powerUps.button.text[lang]
      ))))
      .on('click', () => {
        this.setSelectablePowerUps(this.pickSelectablePowerUps());
        this.activateCloseTimeout();
        this.openSelector();
      })
      .appendTo($(buttonContainer));

    this.statusElement = $('<div></div>')
      .addClass('powerups-selection')
      .appendTo($(statusContainer));

    this.optionContainers = [];
    for (let i = 0; i < 3; i += 1) {
      this.optionContainers.push($('<div></div>').addClass('powerup-container'));
    }

    $(selectionPageContainer).find('.powerups-selector-main')
      .append(createTitle(this.config.dashboard.powerUps.title))
      .append($('<div></div>').addClass('row')
        .append(this.optionContainers.map(container => (
          $('<div></div>').addClass('col-md-4 h-100 col-powerup-selector-item')
            .append(container)))));

    $(selectionPageContainer).find('.powerups-selector-bottom')
      .append(
        $('<button></button>')
          .attr('type', 'button')
          .addClass('btn btn-block btn-dashboard-action btn-cancel')
          .append(
            this.languages.map(lang => (
              $('<span></span>')
                .addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(this.config.dashboard.powerUps.cancelButton.text[lang])
            ))
          )
          .on('click', () => {
            this.cancelCloseTimeout();
            this.closeSelector();
          })
      );

    this.update([]);
  }

  updateSelectButton() {
    if (this.activePowerUps.length >= 2 || this.isSelectorOpen()) {
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

  setSelectablePowerUps(powerUpIds) {
    this.optionContainers.forEach((container, i) => {
      $(container).empty();
      if (powerUpIds[i] !== undefined) {
        $(container).append(this.renderPowerUp(powerUpIds[i]));
      }
    });
  }

  pickSelectablePowerUps() {
    const hideLastActive = this.config.dashboard.powerUps.selector.hideLastActive;

    return Object.keys(this.config.powerUps)
      .filter(id => !(this.config.powerUps[id].enabled === false))
      .filter(id => !(this.activePowerUps.includes(id)))
      .map(id => [id, (hideLastActive && this.lastActivePowerUps.includes(id) ? 1 : 0) + Math.random()])
      .sort(([, recentA], [, recentB]) => recentA - recentB)
      .map(([id]) => id)
      .slice(0, 3);
  }

  renderPowerUp(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append(
            this.languages.map(lang => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(props.title[lang])
            ))
          )
        )
        .append($('<div></div>').addClass('image')
          .attr('style', `background-image: url('static/powerups/${powerUpId}.svg')`))
        .append($('<div></div>').addClass('description')
          .append(
            this.languages.map(lang => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(props.description[lang])
            ))
          )
        )
        .on('click', () => {
          this.events.emit('enable', powerUpId);
          this.disableSelectButton();
          this.cancelCloseTimeout();
          this.closeSelector();
        })
    );
  }

  renderPowerUpThumb(powerUpId) {
    const props = this.config.powerUps[powerUpId];
    return (
      $('<div></div>').addClass('powerup')
        .attr('type', 'button')
        .append($('<div></div>').addClass('title')
          .append(
            this.languages.map(lang => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(props.title[lang])
            ))
          )
        )
        .append($('<button></button>').attr('type', 'button')
          .addClass('btn btn-block btn-power-ups-disable')
          .append(
            this.languages.map(lang => (
              $('<span></span>').addClass(`text text-${lang}`)
              .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(this.config.dashboard.powerUps.disableButton.text[lang])
          )))
          .on('click', () => {
            this.events.emit('disable', powerUpId);
          }))
    );
  }

  isSelectorOpen() {
    return $('body').attr('data-show-slide') === '2';
  }

  openSelector() {
    $('body').attr('data-show-slide', '2');
    this.updateSelectButton();
  }

  closeSelector() {
    $('body').attr('data-show-slide', '1');
    this.updateSelectButton();
  }

  cancelCloseTimeout() {
    if (this.selectorTimeout !== null) {
      clearTimeout(this.selectorTimeout);
      this.selectorTimeout = null;
    }
  }

  activateCloseTimeout() {
    this.cancelCloseTimeout();
    this.selectorTimeout = setTimeout(() => {
      this.selectorTimeout = null;
      this.closeSelector();
    }, this.config.dashboard.powerUps.selector.timeout * 1000);
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
          .append(
            this.languages.map(lang => (
              $('<div></div>').addClass(`text text-${lang}`)
                .addClass(lang === this.mainLanguage ? 'text-main' : 'text-translation')
                .html(this.config.dashboard.powerUps.noneActive.text[lang])
            ))
          )
      );
    } else {
      this.statusElement.append(
        activePowerUps.map(powerUpId => this.renderPowerUpThumb(powerUpId))
      );
    }

    this.updateSelectButton();
  }
}

module.exports = PowerUpSelector;
