class PowerUpManager {
  constructor(config) {
    this.config = config;
    this.powerUps = Object.fromEntries(
      Object.entries(config.powerUps).map(([id]) => [id, false])
    );
  }

  setState(id, enabled) {
    if (enabled) {
      this.enable(id);
    } else {
      this.disable(id);
    }
  }

  enable(id) {
    if (this.powerUps[id] !== undefined) {
      this.powerUps[id] = true;
    }
  }

  disable(id) {
    if (this.powerUps[id] !== undefined) {
      this.powerUps[id] = false;
    }
  }

  activePowerUps() {
    return Object.entries(this.powerUps)
      .filter(([, enabled]) => enabled)
      .map(([id]) => id);
  }
}

module.exports = PowerUpManager;
