const VariableMapView = require('./variable-map-view');
const VariableMapOverlayTransition = require('./variable-map-overlay-transition');

class VariableMapOverlay {
  constructor(config, mapView) {
    this.mapView = mapView;
    this.config = config;

    this.transition = null;
    const parentBounds = mapView.displayObject.getLocalBounds();
    this.view = new VariableMapView(
      mapView.city.map.width,
      mapView.city.map.height
    );
    this.view.scaleToFit(parentBounds.width, parentBounds.height);
    this.view.displayObject.zIndex = 200;
    this.view.displayObject.alpha = 0;

    this.mapView.addOverlay(this.view.displayObject);
  }

  show(data, color) {
    if (this.transition !== null) {
      this.transition.finish();
    }
    this.view.update(data, color);
    this.transition = new VariableMapOverlayTransition(
      this.config.variableMapOverlay.transitionDuration * 60,
      this.view.displayObject,
      this.mapView.zoningLayer,
      () => {
        this.transition = null;
      }
    );
  }

  hide() {
    if (this.transition) {
      this.transition.finish();
    }
    this.transition = new VariableMapOverlayTransition(
      this.config.variableMapOverlay.transitionDuration * 60,
      this.mapView.zoningLayer,
      this.view.displayObject,
      () => {
        this.transition = null;
      }
    );
  }

  animate(time) {
    if (this.transition !== null) {
      this.transition.animate(time);
    }
  }
}

module.exports = VariableMapOverlay;
