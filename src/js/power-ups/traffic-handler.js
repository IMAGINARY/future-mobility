const PowerUpViewHandler = require('../power-up-view-handler');

class TrafficHandler extends PowerUpViewHandler {
  constructor(config, carSpawner) {
    super();
    this.config = config;
    this.carSpawner = carSpawner;
  }

  onChange(activePowerUps) {
    const distribution = Object.assign({}, this.config.traffic['traffic-mode-rates']);

    activePowerUps.forEach((powerUp) => {
      if (this.config.powerUps[powerUp]['traffic-mode-change']) {
        Object.entries(this.config.powerUps[powerUp]['traffic-mode-change'])
          .forEach(([mode, delta]) => {
            if (distribution[mode] !== undefined) {
              distribution[mode] += delta;
            }
          });
      }
    });

    this.carSpawner.setModeDistribution(distribution, activePowerUps);
  }
}

module.exports = TrafficHandler;
