const PowerUpViewHandler = require('../power-up-view-handler');

class SpawnTramHandler extends PowerUpViewHandler {
  constructor(config, carSpawner) {
    super();
    this.config = config;
    this.carSpawner = carSpawner;
  }

  onEnable(powerUp) {
    if (powerUp === 'improved-mass-transit') {
      this.carSpawner.spawn('tram');
      this.carSpawner.spawn('tram');
    }
  }
}

module.exports = SpawnTramHandler;
