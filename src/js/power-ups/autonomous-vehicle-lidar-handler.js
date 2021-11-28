/* globals PIXI */
const PowerUpViewHandler = require('../power-up-view-handler');
const { randomItem } = require('../aux/random');
// const AiCarDriver = require('../cars/ai-car-driver');

const PULSING_INTERVAL = 120;

const PULSE_DURATION = 100;
const PULSE_COLOR = 0xffff00;
const PULSE_RADIUS = 36;

const BOUNDING_DURATION = 180;
const BOUNDING_COLOR = 0xffff00;
const BOUNDING_PADDING = 2;

class AutonomousVehicleLidarHandler extends PowerUpViewHandler {
  constructor(config, carOverlay) {
    super();
    this.config = config;
    this.carOverlay = carOverlay;
    this.enabled = false;
    this.counter = 0;
    this.target = 0;

    this.displayObject = this.createOverlay();

    this.pulsingCars = [];
    this.pulses = [];

    this.boundedCars = [];
    this.boundingBoxes = [];
  }

  createOverlay() {
    const overlay = new PIXI.Container();
    overlay.width = this.carOverlay.displayObject.width;
    overlay.height = this.carOverlay.displayObject.height;
    overlay.x = 0;
    overlay.y = 0;
    overlay.zIndex = this.carOverlay.displayObject.zIndex - 20;
    this.carOverlay.mapView.addOverlay(overlay);

    return overlay;
  }

  onEnable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      this.enabled = true;
    }
  }

  onDisable(powerUp) {
    if (powerUp === 'autonomous-vehicles') {
      this.enabled = false;
    }
  }

  startPulsing() {
    const loop = () => {
      this.pulsingTimer = setTimeout(() => {
        this.firePulse();
        loop();
      }, PULSING_INTERVAL);
    };
    loop();
  }

  endPulsing() {
    if (this.pulsingTimer !== null) {
      clearTimeout(this.pulsingTimer);
      this.pulsingTimer = null;
    }
  }

  firePulse() {
    const elegibleCars = this.carOverlay.cars.filter(car => (
      car.driver.isAutonomous
      && !car.isSpawning
      && !car.isDespawning
      && !this.pulsingCars.includes(car)
    ));
    if (elegibleCars.length > 0) {
      const car = randomItem(elegibleCars);
      this.pulsingCars.push(car);
      this.pulses.push(this.createPulse(car));
    }
  }

  createPulse(car) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, PULSE_COLOR, 0.8);
    graphics.beginFill(PULSE_COLOR, 0.3);
    graphics.drawCircle(0, 0, PULSE_RADIUS);
    graphics.endFill();
    graphics.x = car.sprite.x;
    graphics.y = car.sprite.y;
    graphics.scale.x = 0;
    graphics.scale.y = 0;
    graphics.alpha = 1;
    this.displayObject.addChild(graphics);

    return {
      graphics,
      car,
      duration: PULSE_DURATION,
      elapsed: 0,
    };
  }

  hitCar(car) {
    if (!this.boundedCars.includes(car)
      && !car.isSpawning
      && !car.isDespawning
      && car.isVisible()) {
      this.boundedCars.push(car);
      this.boundingBoxes.push(this.createBoundingBox(car));
    }
  }

  createBoundingBox(car) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(1, BOUNDING_COLOR, 0.8);
    graphics.drawRect(
      (car.sprite.width / -2) - BOUNDING_PADDING,
      (car.sprite.height * -car.sprite.anchor.y) - BOUNDING_PADDING,
      car.sprite.width + 2 * BOUNDING_PADDING,
      car.sprite.height + 2 * BOUNDING_PADDING
    );
    graphics.endFill();
    graphics.x = car.sprite.x;
    graphics.y = car.sprite.y;
    // graphics.anchor.set(car.sprite.anchor.x, car.sprite.anchor.y);
    graphics.rotation = car.sprite.rotation;
    graphics.alpha = 1;
    this.displayObject.addChild(graphics);

    return {
      graphics,
      car,
      duration: BOUNDING_DURATION,
      elapsed: 0,
    };
  }

  onPulseEnd(pulse) {
    this.pulsingCars = this.pulsingCars.filter(car => car !== pulse.car);
    this.displayObject.removeChild(pulse.graphics);
    pulse.graphics.destroy();
    this.pulses = this.pulses.filter(p => p !== pulse);
  }

  onBoundingBoxEnd(boundingBox) {
    this.boundedCars = this.boundedCars.filter(car => car !== boundingBox.car);
    this.displayObject.removeChild(boundingBox.graphics);
    boundingBox.graphics.destroy();
    this.boundingBoxes = this.boundingBoxes.filter(b => b !== boundingBox);
  }

  animate(time) {
    this.pulses.forEach((pulse) => {
      if (pulse.car.sprite) {
        pulse.graphics.x = pulse.car.sprite.x;
        pulse.graphics.y = pulse.car.sprite.y;
      }
      pulse.elapsed += time;

      const progress = Math.min(1, pulse.elapsed / pulse.duration);
      pulse.graphics.alpha = progress <= 0.8 ? 1 : 1 - ((progress - 0.8) / 0.2);
      const scale = Math.min(progress, 1);
      pulse.graphics.scale.x = scale;
      pulse.graphics.scale.y = scale;

      if (progress >= 1) {
        this.onPulseEnd(pulse);
        this.carOverlay.getCarsAround(pulse.car).forEach((carAround) => {
          const cheapDistance = (v1, v2) => Math.max(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
          if (cheapDistance(pulse.car.getSpritePosition(), carAround.getSpritePosition())
            < PULSE_RADIUS * 1.5) {
            this.hitCar(carAround);
          }
        });
      }
    });

    this.boundingBoxes.forEach((boundingBox) => {
      if (boundingBox.car.sprite) {
        boundingBox.graphics.x = boundingBox.car.sprite.x;
        boundingBox.graphics.y = boundingBox.car.sprite.y;
        boundingBox.graphics.rotation = boundingBox.car.sprite.rotation;
      } else {
        this.onBoundingBoxEnd(boundingBox);
      }
      boundingBox.elapsed += time;
      if (boundingBox.elapsed > boundingBox.duration) {
        this.onBoundingBoxEnd(boundingBox);
      }
    });

    if (this.enabled) {
      this.counter += time;
      if (this.counter > this.target) {
        this.firePulse();
        this.counter = 0;
        this.target = Math.random() * PULSING_INTERVAL;
      }
    }
  }
}

module.exports = AutonomousVehicleLidarHandler;
