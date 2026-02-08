const EventEmitter = require('events');
const logger = require('winston');
const City = require('../../src/js/lib/model/city');
const DataManager = require('../../src/js/lib/model/data-manager');
const PowerUpManager = require('../../src/js/lib/model/power-up-manager');
const PowerUpDataModifier = require('../../src/js/lib/model/power-up-data-modifier');
const dataSrcCfg = require('../../src/js/lib/init/inject-data-src-cfg');
const createThrottledFunction = require('../../src/js/lib/helpers/throttled');

class ModelManager {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();

    logger.verbose(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
    this.city = new City(config.cityWidth, config.cityHeight);

    this.cityMapMode = 'default';
    this.cityMapModeTimer = null;

    logger.verbose(`Initializing DataManager with throttle time ${config.dataManager.throttleTime} ms.`);
    this.stats = new DataManager(
      config.cityWidth,
      config.cityHeight,
      {
        throttleTime: config.dataManager.throttleTime,
      }
    );

    logger.verbose('Registering data sources:');
    dataSrcCfg.dataSources.forEach((DataSource) => {
      logger.verbose(`- ${DataSource.name}`);
      this.stats.registerSource(new DataSource(this.city, this.config));
    });

    this.recalculateStats = createThrottledFunction(() => {
      this.stats.calculateAll();
    }, config.dataManager.throttleTime);

    this.city.events.on('update', () => {
      this.recalculateStats();
    });

    logger.verbose('Initializing PowerUpManager');
    this.powerUpMgr = new PowerUpManager(this.config);
    logger.verbose('Registering PowerUpManager as a DataModifier');
    this.stats.registerModifier(new PowerUpDataModifier(this.config, this.powerUpMgr));
    this.powerUpMgr.events.on('update', () => {
      this.recalculateStats();
    });

    this.city.events.on('update', () => {
      this.events.emit('city-map-update');
    });

    this.stats.events.on('update', () => {
      this.events.emit('stats-update');
    });

    this.powerUpMgr.events.on('update', () => {
      this.events.emit('power-ups-update');
    });
  }

  getCity() {
    return this.city;
  }

  setCityMap(cells, orientations = null) {
    this.city.setMap(cells, orientations);
  }

  getCityMapMode() {
    return this.cityMapMode;
  }

  setCityMapMode(mode = 'default', duration = null) {
    logger.verbose(`Setting city map mode to "${mode}"${duration !== null ? ` for ${duration} ms` : ''}.`);
    if (this.cityMapModeTimer !== null) {
      logger.verbose('Clearing existing city map mode timer.');
      clearTimeout(this.cityMapModeTimer);
      this.cityMapModeTimer = null;
    }
    this.cityMapMode = mode;
    this.events.emit('city-map-mode-update');
    if (duration !== null) {
      this.cityMapModeTimer = setTimeout(() => {
        logger.verbose('City map mode duration expired, reverting to "default" mode.');
        this.cityMapModeTimer = null;
        this.setCityMapMode('default');
      }, duration);
    }
  }

  getGoals() {
    return this.stats.getGoals();
  }

  getMainVariables() {
    return Object.fromEntries(
      Object.entries(this.config.dashboard.status.indexes)
        .map(([id, props]) => [id, this.stats.get(props.variable)])
    );
  }

  getMappedVariable(name) {
    const varName = `${name}-map`;
    return this.stats.has(varName) ? this.stats.get(varName) : null;
  }

  getActivePowerUps() {
    return this.powerUpMgr.getEnabled();
  }

  enablePowerUp(powerUpName) {
    this.powerUpMgr.enable(powerUpName);
  }

  disablePowerUp(powerUpName) {
    this.powerUpMgr.disable(powerUpName);
  }
}

module.exports = ModelManager;
