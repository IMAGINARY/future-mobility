const PowerUpViewHandler = require('../power-up-view-handler');
const AiCarDriver = require('../cars/ai-car-driver');

class AutonomousVehicleHandler extends PowerUpViewHandler {
  constructor(config, carSpawner) {
    super();
    this.config = config;
    this.carSpawner = carSpawner;
  }

  onEnable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      this.previousDefaultDriver = this.carSpawner.DefaultDriver;
      this.carSpawner.DefaultDriver = AiCarDriver;
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      if (this.previousDefaultDriver) {
        this.carSpawner.DefaultDriver = this.previousDefaultDriver;
      }
    }
  }
}

module.exports = AutonomousVehicleHandler;
