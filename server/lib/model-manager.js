const EventEmitter = require('events');
const logger = require('winston');
const City = require('../../src/js/city');
const DataManager = require('../../src/js/data-manager');
const PowerUpManager = require('../../src/js/power-up-manager');
const PowerUpDataModifier = require('../../src/js/power-up-data-modifier');
const dataSrcCfg = require('../../src/js/init/data-src-cfg');
const createThrottledFunction = require('../../src/js/helpers/throttled');

class ModelManager {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();

    logger.verbose(`Initializing ${config.cityWidth} x ${config.cityHeight} city.`);
    this.city = new City(config.cityWidth, config.cityHeight);

    logger.verbose(`Initializing DataManager with throttle time ${config.dataManager.throttleTime} ms.`);
    this.stats = new DataManager({
      throttleTime: config.dataManager.throttleTime,
    });

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

  getGoals() {
    return this.stats.getGoals();
  }

  getMainVariables() {
    return Object.fromEntries(
      Object.entries(dataSrcCfg.mainVariables)
        .map(([name, srcVar]) => [name, this.stats.get(srcVar)])
    );
  }

  getMappedVariable(name) {
    return this.stats.get(`${name}-map`);
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
