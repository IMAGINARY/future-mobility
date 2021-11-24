class PowerUpViewMgr {
  constructor() {
    this.activePowerUps = [];
    this.handlers = [];
  }

  registerHandler(handler) {
    this.handlers.push(handler);
  }

  update(activePowerUps) {
    let changes = false;
    activePowerUps.forEach((powerUp) => {
      if (!this.activePowerUps.includes(powerUp)) {
        this.handleEnable(powerUp, activePowerUps);
        changes = true;
      }
    });
    this.activePowerUps.forEach((powerUp) => {
      if (!activePowerUps.includes(powerUp)) {
        this.handleDisable(powerUp, activePowerUps);
        changes = true;
      }
    });

    if (changes) {
      this.activePowerUps = activePowerUps;
      this.handlePowerUpChanges(activePowerUps);
    }
  }

  handleEnable(powerUp, activePowerUps) {
    this.handlers.forEach((handler) => {
      handler.onEnable(powerUp, activePowerUps);
    });
  }

  handleDisable(powerUp, activePowerUps) {
    this.handlers.forEach((handler) => {
      handler.onDisable(powerUp, activePowerUps);
    });
  }

  handlePowerUpChanges(activePowerUps) {
    this.handlers.forEach((handler) => {
      handler.onChange(activePowerUps);
    });
  }
}

module.exports = PowerUpViewMgr;
