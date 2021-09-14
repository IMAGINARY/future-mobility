/* globals PIXI */
const Vec2 = require('vec2');
const CarDriver = require('./car-driver');
const Dir = require('../aux/cardinal-directions');
const RoadTile = require('./road-tile');
const { TILE_SIZE } = require('../map-view');
const SpriteFader = require('../aux/sprite-fader');
const PathStraight = require('./path-straight');
const PathArc = require('./path-arc');
const PulledCarDriver = require('./pulled-car-driver');

// Max lifetime of cars
const MAX_LIFETIME = 2 * 60 * 60; // Approx. 2 minutes
const MAX_TIME_STOPPED = 60 * 60; // Approx. 1 minute

class Car {
  constructor(carOverlay, texture, tileX, tileY, entrySide, lane, maxSpeed = 1) {
    this.overlay = carOverlay;
    this.driver = new CarDriver(this);
    this.lane = lane;
    this.maxSpeed = maxSpeed;
    this.speed = maxSpeed;
    this.sprite = Car.createSprite(texture);
    this.fader = new SpriteFader(this.sprite);
    this.lifetime = 0;
    this.timeStopped = 0;
    this.isSpawning = true;
    this.isDespawning = false;
    this.frontWagon = null;
    this.backWagon = null;

    this.path = null;
    this.setTile(tileX, tileY, entrySide);

    this.setSpritePosition(this.tilePosition().add(RoadTile.entryPoint(this.lane, this.entrySide)));
    this.sprite.rotation = Dir.asAngle(Dir.opposite(this.entrySide));
  }

  static createSprite(texture) {
    const sprite = new PIXI.Sprite();
    sprite.texture = texture;
    sprite.width = texture.width;
    sprite.height = texture.height;
    // sprite.roundPixels = true;
    sprite.anchor.set(0.5, 0.75);
    sprite.visible = true;
    sprite.alpha = 0;

    return sprite;
  }

  destroy() {
    if (this.backWagon) {
      this.backWagon.removeFrontWagon();
    }
    this.sprite.destroy();
    this.sprite = null;
    this.overlay = null;
  }

  despawn() {
    if (!this.isDespawning) {
      this.isDespawning = true;
      this.fader.fadeOut(() => {
        this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);
        this.overlay.onCarExitMap(this);
      });
    }
  }

  despawnWagons() {
    let nextWagon = this.backWagon;
    while (nextWagon) {
      nextWagon.despawn();
      nextWagon = nextWagon.backWagon;
    }
  }

  addWagon(car) {
    this.backWagon = car;
    car.frontWagon = this;
    car.driver = new PulledCarDriver(car);
  }

  removeFrontWagon() {
    this.frontWagon = null;
    this.driver = new CarDriver(this);
  }

  isPulling(car) {
    let eachCar = this;
    while (eachCar.backWagon) {
      if (car === eachCar.backWagon) {
        return true;
      }
      eachCar = eachCar.backWagon;
    }
    return false;
  }

  setTile(x, y, entrySide) {
    // Check if the coordinates are valid
    if (!this.overlay.city.map.isValidCoords(x, y)) {
      this.despawn();
      return;
    }

    // Check if the tile has an exit
    const exitSide = this.driver.chooseExitSide(x, y, entrySide);
    if (exitSide === null) {
      this.despawn();
      return;
    }

    this.tile = { x, y };
    this.entrySide = entrySide;
    this.exitSide = exitSide;

    const remainder = this.path !== null ? this.path.remainder : 0;
    this.path = this.exitSide === Dir.opposite(this.entrySide)
      ? new PathStraight(this.lane, this.entrySide)
      : new PathArc(this.lane, this.entrySide, this.exitSide);
    this.path.advance(remainder);

    this.onEnterTile();
  }

  getNextTile() {
    return Dir.adjCoords(this.tile.x, this.tile.y, this.exitSide);
  }

  getNextEntry() {
    return Dir.opposite(this.exitSide);
  }

  tilePosition() {
    return Vec2(this.tile.x * TILE_SIZE, this.tile.y * TILE_SIZE);
  }

  setSpritePosition(v) {
    this.sprite.x = v.x;
    this.sprite.y = v.y;
  }

  getSpritePosition() {
    return Vec2(this.sprite.x, this.sprite.y);
  }

  onEnterTile() {
    this.overlay.onCarEnterTile(this, this.tile.x, this.tile.y);
  }

  onGreenLight() {
    this.driver.onGreenLight();
  }

  onRedLight() {
    this.driver.onRedLight();
  }

  onExitTile() {
    this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);

    // Transfer the car to the next tile
    this.setTile(...this.getNextTile(), this.getNextEntry());
  }

  hasCarsOverlapping() {
    const cheapDistance = (v1, v2) => Math.max(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
    const position = this.getSpritePosition();
    return this.overlay.getCarsAround(this).some((carAround) => {
      const overlapDistance = this.sprite.height / 2 + carAround.sprite.height / 2;
      return cheapDistance(carAround.getSpritePosition(), position) < overlapDistance
        && !this.isPulling(carAround) && !carAround.isPulling(this);
    });
  }

  animate(time) {
    this.driver.adjustCarSpeed();

    if (this.isSpawning && !this.hasCarsOverlapping()
      && (!this.frontWagon || this.speed > 0)) {
      this.isSpawning = false;
    }

    if (this.speed > 0) {
      this.timeStopped = 0;
      this.path.advance(this.speed * time);
      this.setSpritePosition(this.tilePosition().add(this.path.position));
      this.sprite.rotation = this.path.rotation;
      if (this.path.progress === 1) {
        this.onExitTile();
      }
    } else {
      this.timeStopped += time;
    }

    this.lifetime += time;
    if (!this.frontWagon) {
      if ((this.lifetime > MAX_LIFETIME || this.timeStopped > MAX_TIME_STOPPED)
        && this.overlay.options.maxLifetime) {
        this.despawn();
        this.despawnWagons();
      }
    }

    if (this.isDespawning
      || this.isSpawning
      || !this.overlay.roads.isRoad(this.tile.x, this.tile.y)) {
      this.fader.fadeOut();
    } else {
      this.fader.fadeIn();
    }
    this.fader.animate(time);
  }
}

module.exports = Car;
