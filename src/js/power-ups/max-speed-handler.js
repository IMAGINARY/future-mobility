const PowerUpViewHandler = require('../power-up-view-handler');

class MaxSpeedHandler extends PowerUpViewHandler {
  constructor(config, carOverlay) {
    super();
    this.config = config;
    this.carOverlay = carOverlay;
  }

  onEnable(powerUp) {
    if (powerUp === 'reduced-speed-limit') {
      this.previousMaxSpeed = this.carOverlay.cityMaxSpeed;
      this.carOverlay.cityMaxSpeed = 0.4;
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'reduced-speed-limit') {
      this.carOverlay.cityMaxSpeed = (this.previousMaxSpeed || 0.7);
    }
  }
}

module.exports = MaxSpeedHandler;
