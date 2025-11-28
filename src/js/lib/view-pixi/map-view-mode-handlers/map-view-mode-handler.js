/* eslint-disable class-methods-use-this,no-unused-vars */
class MapViewModeHandler {
  /**
   * Prevent direct instantiation of the abstract base.
   * Subclasses should extend this class and may implement any subset of the protocol methods.
   */
  constructor() {
    if (new.target === MapViewModeHandler) {
      throw new Error('MapViewModeHandler is an abstract class and must be extended.');
    }
  }

  /**
   * Called when a mode is entered.
   * Default: no-op. Subclasses may override.
   * @param {string|null} previousMode
   * @param {string} currentMode
   * @param {array|null} data
   */
  onEnter(currentMode, data, previousMode) {
    // default no-op implementation
  }

  /**
   * Called when a mode is exited.
   * Default: no-op. Subclasses may override.
   * @param {string} currentMode
   * @param {string|null} nextMode
   */
  onExit(currentMode, nextMode) {
    // default no-op implementation
  }

  /**
   * Called on map updates while this mode is active.
   * Default: no-op. Subclasses may override.
   * @param {string} mode
   */
  onMapUpdate(mode) {
    // default no-op implementation
  }

  onDataUpdate(data) {
    // default no-op implementation
  }

  /**
   * Validator to check if an arbitrary object implements at least part of the required protocol.
   * Returns true if the object provides at least one of the protocol methods (or is an instance).
   * @param {Object} handler
   * @returns {boolean}
   */
  static isValid(handler) {
    if (!handler) return false;
    // If it's an instance of this class, it's valid (has defaults)
    if (handler instanceof MapViewModeHandler) return true;
    // Otherwise accept partial implementations (at least one method)
    return typeof handler.onEnter === 'function'
      || typeof handler.onExit === 'function'
      || typeof handler.onMapUpdate === 'function'
      || typeof handler.onDataUpdate === 'function';
  }
}

module.exports = MapViewModeHandler;
