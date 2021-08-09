/* globals PIXI */
const Vec2 = require('vec2');
const Dir = require('../aux/cardinal-directions');
const RoadTile = require('./road-tile');
const { TILE_SIZE } = require('../map-view');
const SpriteFader = require('../aux/sprite-fader');
const PathStraight = require('./path-straight');
const PathArc = require('./path-arc');
const { randomItem } = require('../aux/random');

// The closest a car can get to another
const SAFE_DISTANCE = TILE_SIZE / 20;
// Distance at which a car begins to slow down when there's another in front
const SLOWDOWN_DISTANCE = TILE_SIZE / 3;
const LIGHT_CHANGE_DELAY = [300, 800];
// Max lifetime of cars
const MAX_LIFETIME = 2 * 60 * 60; // Approx. 2 minutes

class Car {
  constructor(carOverlay, texture, tileX, tileY, entrySide, lane, maxSpeed = 1) {
    this.overlay = carOverlay;
    this.lane = lane;
    this.maxSpeed = maxSpeed;
    this.speed = maxSpeed;
    this.inRedLight = false;
    this.sprite = Car.createSprite(texture);
    this.fader = new SpriteFader(this.sprite);
    this.fader.fadeIn();
    this.lifetime = 0;
    this.killed = false;
    this.carDistanceFactor = 1 + Math.random() * 0.6;
    this.safeDistance = SAFE_DISTANCE * this.carDistanceFactor;
    this.slowdownDistance = SLOWDOWN_DISTANCE * this.carDistanceFactor;

    this.path = null;
    this.setTile(tileX, tileY, entrySide);

    this.setSpritePosition(this.tilePosition().add(RoadTile.entryPoint(this.lane, this.entrySide)));
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
    this.sprite.destroy();
    this.sprite = null;
    this.overlay = null;
  }

  kill() {
    if (!this.killed) {
      this.killed = true;
      this.fader.fadeOut(() => {
        this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);
        this.overlay.onCarExitMap(this);
      });
    }
  }

  setTile(x, y, entrySide) {
    // Check if the coordinates are valid
    if (!this.overlay.city.map.isValidCoords(x, y)) {
      this.kill();
      return;
    }

    // Check if the tile has an exit
    const exitSide = this.getRandomExitSide(x, y, entrySide);
    if (exitSide === null) {
      this.kill();
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

  getRandomExitSide(tileX, tileY, entrySide) {
    // Select the direction based on road availability
    const options = [];

    // If it's possible to go forward, add the option
    if (this.overlay.roads.hasAdjRoad(tileX, tileY, Dir.opposite(entrySide))) {
      // Add it three times to make it more likely than turning
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
    }
    // If it's possible to turn right, add the option
    if ((options.length === 0 || this.lane === RoadTile.OUTER_LANE)
      && this.overlay.roads.hasAdjRoad(tileX, tileY, Dir.ccw(entrySide))) {
      options.push(Dir.ccw(entrySide));
    }
    // If it's not possible to go forward or turn right,
    // turn left if possible.
    if (options.length === 0
      && this.overlay.roads.hasAdjRoad(tileX, tileY, Dir.cw(entrySide))) {
      options.push(Dir.cw(entrySide));
    }

    // Randomly select one of the possible directions
    // return null if there's no way to go
    return randomItem(options) || null;
  }

  onEnterTile() {
    this.overlay.onCarEnterTile(this, this.tile.x, this.tile.y);
  }

  onGreenLight() {
    const [minDelay, maxDelay] = LIGHT_CHANGE_DELAY;
    setTimeout(() => {
      this.inRedLight = false;
    }, minDelay + Math.random() * (maxDelay - minDelay));
  }

  onRedLight() {
    this.inRedLight = true;
  }

  onExitTile() {
    this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);

    // Transfer the car to the next tile
    this.setTile(...this.getNextTile(), this.getNextEntry());
  }

  animate(time) {
    this.lifetime += time;

    let shouldFade = false;
    const position = this.getSpritePosition();

    const carInFront = this.overlay.getCarInFront(this);
    if (carInFront) {
      const overlapDistance = this.sprite.height / 2 + carInFront.sprite.height / 2;
      const distanceToCarInFront = this.overlay.getCarInFront(this)
        .getSpritePosition()
        .distance(position) - overlapDistance;
      if (distanceToCarInFront < 0) {
        // Using just the distance generates false positives when the cars are orthogonal to each
        // other. The test can be improved by testing sprite overlap through PIXI.Sprite.getBounds
        // ... but maybe it should be done after moving the sprite.
        shouldFade = true;
      }
      if (distanceToCarInFront <= this.safeDistance) {
        this.speed = 0;
      } else if (distanceToCarInFront <= this.slowdownDistance) {
        this.speed = this.maxSpeed * (1 - this.safeDistance / distanceToCarInFront);
      } else if (this.speed < this.maxSpeed) {
        this.speed = Math.min(this.speed + this.maxSpeed / 5, this.maxSpeed);
      }
    } else if (this.speed < this.maxSpeed) {
      this.speed = Math.min(this.speed + this.maxSpeed / 5, this.maxSpeed);
    }

    if (this.inRedLight && this.speed > 0) {
      this.speed = 0;
    }

    if (this.speed > 0) {
      this.path.advance(this.speed * time);
      this.setSpritePosition(this.tilePosition().add(this.path.position));
      this.sprite.rotation = this.path.rotation;
      if (this.path.progress === 1) {
        this.onExitTile();
      }
    }

    if (this.lifetime > MAX_LIFETIME && this.overlay.options.maxLifetime) {
      this.kill();
    }

    // This initial check to see if the car was killed is only needed because the car
    // might be destroyed on the onExitTile above. Refactor.
    if (this.killed || !this.overlay.roads.isRoad(this.tile.x, this.tile.y)) {
      shouldFade = true;
    }

    if (shouldFade) {
      this.fader.fadeOut();
    } else {
      this.fader.fadeIn();
    }

    this.fader.animate(time);
  }
}

module.exports = Car;
