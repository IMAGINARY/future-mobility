const logger = require('../helpers/logger');

class KeyboardController {
  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.installHandler();

    this.keyActions = {};
  }

  installHandler() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  uninstallHandler() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    const action = this.keyActions[event.key];
    if (action) {
      action(event);
    }
  }

  registerKeyAction(key, action) {
    if (this.keyActions[key]) {
      logger.warn(`Overwriting existing action for key "${key}"`);
    }
    this.keyActions[key] = action;
  }

  registerKeyActions(actions) {
    Object.entries(actions).forEach(([key, action]) => {
      this.registerKeyAction(key, action);
    });
  }
}

module.exports = KeyboardController;
