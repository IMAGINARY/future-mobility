const VariableMapView = require('./variable-map-view');

class VariableMapOverlayTransition {
  constructor(duration, inView, outView, onCompleteCallback) {
    this.duration = duration;
    this.elapsed = 0;
    this.inView = inView;
    this.outView = outView;
    this.onCompletCallback = onCompleteCallback;
    this.finished = false;
  }

  animate(time) {
    if (!this.finished) {
      this.elapsed += time;

      this.outView.alpha = 1 - Math.min(this.elapsed / this.duration, 1);
      this.inView.alpha = Math.min(this.elapsed / this.duration, 1);
      if (this.elapsed > this.duration) {
        this.finished = true;
        this.onCompletCallback();
      }
    }
  }

  finish() {
    if (!this.finished) {
      this.elapsed = this.duration;
      this.outView.alpha = 0;
      this.inView.alpha = 1;
      this.finished = true;
      this.onCompletCallback();
    }
  }
}

class VariableMapOverlay {
  constructor(mapView, config) {
    this.mapView = mapView;
    this.config = config;

    this.transition = null;
    const parentBounds = mapView.displayObject.getLocalBounds();
    this.view = new VariableMapView(
      mapView.city.map.width,
      mapView.city.map.height
    );
    this.view.displayObject.width = parentBounds.width;
    this.view.displayObject.height = parentBounds.height;
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
