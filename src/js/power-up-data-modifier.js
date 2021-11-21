/* eslint-disable no-underscore-dangle */
class PowerUpDataModifier {
  constructor(config, powerUpManager) {
    this.config = config;
    this.manager = powerUpManager;
  }

  getModifiers(variableId) {
    const modifiers = [];

    this.manager.activePowerUps().forEach((powerUp) => {
      if (this.config.powerUps[powerUp] && this.config.powerUps[powerUp].modifiers
        && this.config.powerUps[powerUp].modifiers[variableId]) {
        modifiers.push(this.config.powerUps[powerUp].modifiers[variableId]);
      }

      if (this.config.powerUps[powerUp] && this.config.powerUps[powerUp].modifiers
        && this.config.powerUps[powerUp].modifiers._synergy) {
        Object.keys(this.config.powerUps[powerUp].modifiers._synergy)
          .forEach((synergyPowerUp) => {
            if (this.manager.powerUps[synergyPowerUp]
              && this.config.powerUps[powerUp].modifiers
              && this.config.powerUps[powerUp].modifiers._synergy
              && this.config.powerUps[powerUp].modifiers._synergy[synergyPowerUp]
              && this.config.powerUps[powerUp].modifiers._synergy[synergyPowerUp][variableId]) {
              modifiers.push(
                this.config.powerUps[powerUp].modifiers._synergy[synergyPowerUp][variableId]
              );
            }
          });
      }
    });

    return modifiers;
  }
}

module.exports = PowerUpDataModifier;
