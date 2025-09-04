const EventEmitter = require('events');
const PowerUpSelector = require('./power-up-selector');
const CitizenRequestView = require('./citizen-request-view');
const CitizenRequestViewMgr = require('./citizen-request-view-mgr');
const IndexListView = require('./index-list-view');
const ActionsPane = require('./actions-pane');
const { bindCreateTitle } = require('./titles');
const PowerUpStatus = require('./power-up-status');

class DashboardApp {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();

    const { languages } = this.config.dashboard;
    const mainLanguage = languages[0];
    const createTitle = bindCreateTitle(languages);

    this.citizenRequestView = new CitizenRequestView(this.config);
    this.citizenRequestViewMgr = new CitizenRequestViewMgr(this.citizenRequestView);
    this.indexListView = new IndexListView(this.config, this.config.dashboard.status.indexes);
    this.actionsPane = new ActionsPane(this.config);
    this.powerUpStatus = new PowerUpStatus(this.config);
    this.powerUpSelector = new PowerUpSelector(this.config);

    this.powerUpSelectorTimeout = null;

    this.$element = $('<div></div>')
      .addClass('dashboard-app')
      .addClass(`theme-${this.config?.dashboard?.theme ?? 'default'}`)
      .addClass(`with-language-count-${languages.length}`)
      .addClass(`with-main-language-${mainLanguage}`)
      .addClass(languages.map((lang) => `with-language-${lang}`).join(' '));

    this.$slideStrip = $('<div></div>')
      .addClass(['dashboard', 'slide-strip'])
      .data('show-slide', '1')
      .appendTo(this.$element);

    this.$powerUpSelectorButton = $('<button></button>')
      .attr('type', 'button')
      .addClass('btn btn-dashboard-action btn-power-ups-activate')
      .append(languages.map((lang) => (
        $('<span></span>')
          .addClass(`text text-${lang}`)
          .addClass(lang === mainLanguage ? 'text-main' : 'text-translation')
          .html(this.config.dashboard.powerUps.button.text[lang]))))
      .on('click', this.handlePowerUpSelectorButtonClick.bind(this));

    this.$mainSlide = $('<div></div>')
      .attr('id', 'slide-1')
      .addClass(['slide', 'slide-main'])
      .appendTo(this.$slideStrip)
      .append(
        $('<div></div>')
          .addClass(['container-fluid', 'h-100'])
          .append(
            $('<div></div>')
              .addClass(['row', 'h-82'])
              .append(
                $('<div></div>')
                  .attr('id', 'col-1')
                  .addClass('col-4')
                  .append(createTitle(config.dashboard.goals.title))
                  .append(this.citizenRequestView.$element),
                $('<div></div>')
                  .attr('id', 'col-2')
                  .addClass('col-4')
                  .append(createTitle(config.dashboard.status.title))
                  .append(this.indexListView.$element),
                $('<div></div>')
                  .attr('id', 'col-3')
                  .addClass('col-4')
                  .append(createTitle(config.dashboard.powerUps.title))
                  .append(this.powerUpStatus.$element)
              )
          )
          .append(
            $('<div></div>')
              .addClass(['row', 'h-18'])
              .append(
                $('<div></div>')
                  .attr('id', 'col-actions')
                  .addClass('col-8')
                  .append(this.actionsPane.$element),
                $('<div></div>')
                  .attr('id', 'col-actions-powerup')
                  .addClass(['col-4', 'd-grid', 'gap-2'])
                  .append(this.$powerUpSelectorButton)
              )
          )
      );

    this.actionsPane.buttons.forEach(($button) => $button.on('click', (ev) => {
      const actionId = ev.currentTarget.id;
      if ((actionId === 'show-pollution' || actionId === 'show-noise')) {
        this.actionsPane.disableAll();

        setTimeout(() => {
          this.actionsPane.enableAll();
        }, (config.variableMapOverlay.overlayDuration
          + config.variableMapOverlay.transitionDuration) * 1000);

        this.events.emit('action', actionId);
      }
      ev.stopPropagation();
    }));

    this.$powerUpMenuSlide = $('<div></div>')
      .attr('id', 'slide-2')
      .addClass(['slide', 'slide-powerup'])
      .append(this.powerUpSelector.$element)
      .appendTo(this.$slideStrip);

    this.powerUpSelector.events.on('cancel', () => {
      this.cancelPowerUpSelectorCloseTimeout();
      this.closePowerUpSelector();
    });
    this.powerUpSelector.events.on('select', (powerUpId) => {
      this.events.emit('powerUpEnable', powerUpId);
      this.disablePowerUpSelectorButton();
      this.cancelPowerUpSelectorCloseTimeout();
      this.closePowerUpSelector();
    });
    this.powerUpStatus.events.on('disable', (powerUpId) => {
      this.events.emit('powerUpDisable', powerUpId);
    });
  }

  updateGoals(goals) {
    this.citizenRequestViewMgr.handleUpdate(goals);
  }

  updateVariables(variables) {
    this.indexListView.setValues(variables);
  }

  updateActivePowerUps(activePowerUps) {
    this.powerUpSelector.update(activePowerUps);
    this.powerUpStatus.update(activePowerUps);
    this.updatePowerUpSelectorButton();
  }

  enableAllActions() {
    this.actionsPane.enableAll();
  }

  handlePowerUpSelectorButtonClick() {
    this.powerUpSelector.makePowerUpSelection();
    this.activatePowerUpSelectorCloseTimeout();
    this.openPowerUpSelector();
  }

  updatePowerUpSelectorButton() {
    if (this.powerUpSelector.getActivePowerUps().length >= 2 || this.isPowerUpSelectorOpen()) {
      this.disablePowerUpSelectorButton();
    } else {
      this.enablePowerUpSelectorButton();
    }
  }

  disablePowerUpSelectorButton() {
    this.$powerUpSelectorButton.attr('disabled', true);
    this.$powerUpSelectorButton.addClass('disabled');
  }

  enablePowerUpSelectorButton() {
    this.$powerUpSelectorButton.attr('disabled', false);
    this.$powerUpSelectorButton.removeClass('disabled');
  }

  isPowerUpSelectorOpen() {
    return this.$slideStrip.attr('data-show-slide') === '2';
  }

  openPowerUpSelector() {
    this.$slideStrip.attr('data-show-slide', '2');
    this.updatePowerUpSelectorButton();
  }

  closePowerUpSelector() {
    this.$slideStrip.attr('data-show-slide', '1');
    this.updatePowerUpSelectorButton();
  }

  activatePowerUpSelectorCloseTimeout() {
    this.cancelPowerUpSelectorCloseTimeout();
    this.powerUpSelectorTimeout = setTimeout(() => {
      this.powerUpSelectorTimeout = null;
      this.closePowerUpSelector();
    }, this.config.dashboard.powerUps.selector.timeout * 1000);
  }

  cancelPowerUpSelectorCloseTimeout() {
    if (this.powerUpSelectorTimeout !== null) {
      clearTimeout(this.powerUpSelectorTimeout);
      this.powerUpSelectorTimeout = null;
    }
  }
}

module.exports = DashboardApp;
