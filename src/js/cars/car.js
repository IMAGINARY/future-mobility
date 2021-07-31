/* globals PIXI */
const Vec2 = require('vec2');
const Dir = require('../aux/cardinal-directions');
const RoadTile = require('./road-tile');
const { TILE_SIZE } = require('../map-view');

const adjTile = (x, y, side) => [x + Dir.asVector(side)[0], y + Dir.asVector(side)[1]];
// The closest a car can get to another
const SAFE_DISTANCE = TILE_SIZE / 20;
// Distance at which a car begins to slow down when there's another in front
const SLOWDOWN_DISTANCE = TILE_SIZE / 3;
const LIGHT_CHANGE_DELAY = [300, 800];

class Car {
  constructor(carOverlay, texture, tileX, tileY, entrySide, lane) {
    this.overlay = carOverlay;
    this.lane = lane;
    this.maxSpeed = 1;
    this.speed = 1;
    this.inRedLight = false;
    this.sprite = Car.createSprite(texture);

    this.setTile(tileX, tileY, entrySide);

    this.setPosition(this.tilePosition().add(RoadTile.entryPoint(this.lane, this.entrySide)));
  }

  static createSprite(texture) {
    const sprite = new PIXI.Sprite();
    sprite.texture = texture;
    sprite.width = texture.baseTexture.width;
    sprite.height = texture.baseTexture.height;
    sprite.roundPixels = true;
    sprite.anchor.set(0.5, 0.75);
    sprite.visible = true;

    return sprite;
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

    this.entryPoint = this.tilePosition().add(RoadTile.entryPoint(this.lane, this.entrySide));
    this.exitPoint = this.tilePosition().add(RoadTile.exitPoint(this.lane, this.exitSide));
    this.progress = 0;

    this.onEnterTile();
  }

  kill() {
    this.overlay.onCarExitMap(this);
  }

  tilePosition() {
    return Vec2(this.tile.x * TILE_SIZE, this.tile.y * TILE_SIZE);
  }

  setPosition(v) {
    this.sprite.x = v.x;
    this.sprite.y = v.y;
    // to do: this calculation below maybe can be made faster without sqrt
    this.progress = 1 - (v.distance(this.exitPoint) / this.entryPoint.distance(this.exitPoint));
  }

  getPosition() {
    return Vec2(this.sprite.x, this.sprite.y);
  }

  destroy() {
    this.sprite.destroy();
    this.sprite = null;
    this.overlay = null;
  }

  getRandomExitSide(tileX, tileY, entrySide) {
    // Select the direction based on road availability
    const options = [];
    const isRoad = (x, y) => (!this.overlay.city.map.isValidCoords(x, y)
      || this.overlay.city.map.get(x, y) === this.overlay.roadTileId);

    // If it's possible to go forward, add the option
    if (isRoad(...adjTile(tileX, tileY, Dir.opposite(entrySide)))) {
      // Add it three times to make it more likely than turning
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
      options.push(Dir.opposite(entrySide));
    }
    // If it's possible to turn right, add the option
    if ((options.length === 0 || this.lane === RoadTile.OUTER_LANE)
      && isRoad(...adjTile(tileX, tileY, Dir.ccw(entrySide)))) {
      options.push(Dir.ccw(entrySide));
    }
    // If it's not possible to go forward or turn right,
    // turn left if possible.
    if (options.length === 0
      && isRoad(...adjTile(tileX, tileY, Dir.cw(entrySide)))) {
      options.push(Dir.cw(entrySide));
    }

    // Randomly select one of the possible directions
    // return null if there's no way to go
    return options[Math.floor(Math.random() * options.length)] || null;
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

  getNextTile() {
    return adjTile(this.tile.x, this.tile.y, this.exitSide);
  }

  getNextEntry() {
    return Dir.opposite(this.exitSide);
  }

  onExitTile() {
    this.overlay.onCarExitTile(this, this.tile.x, this.tile.y);

    // Transfer the car to the next tile
    this.setTile(...this.getNextTile(), this.getNextEntry());
  }

  getDistanceFromEntry() {
    switch (this.entrySide) {
      case 'N':
        return this.getPosition().y - this.tilePosition().y;
      case 'E':
        return this.tilePosition().x + TILE_SIZE - this.getPosition().x;
      case 'W':
        return this.getPosition().x - this.tilePosition().x;
      case 'S':
        return this.tilePosition().y + TILE_SIZE - this.getPosition().y;
      default:
        return 0;
    }
  }

  animate(time) {
    const position = this.getPosition();
    const shortestAngle = angle => (Math.abs(angle) > Math.PI
      ? (Math.PI * 2 - Math.abs(angle)) * Math.sign(angle) * -1
      : angle);

    const angleFrom = Dir.asAngle(Dir.opposite(this.entrySide));
    const angleTo = Dir.asAngle(this.exitSide);
    const uglyAdjustment = 1.05;
    this.sprite.rotation = angleFrom
      + shortestAngle(angleTo - angleFrom) * Math.min(this.progress * uglyAdjustment, 1);

    const carInFront = this.overlay.getCarInFront(this);
    if (carInFront) {
      const distanceToCarInFront = this.overlay.getCarInFront(this)
        .getPosition()
        .distance(position) - (this.sprite.height / 2 + carInFront.sprite.height / 2);
      if (distanceToCarInFront <= SAFE_DISTANCE) {
        this.speed = 0;
      } else if (distanceToCarInFront <= SLOWDOWN_DISTANCE) {
        this.speed = this.maxSpeed * (1 - SAFE_DISTANCE / distanceToCarInFront);
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
      const newPosition = Vec2(0, this.speed * time).rotate(this.sprite.rotation).add(position);

      // Clamp movement so it doesn't go past the target coordinates
      const signXMove = Math.sign(this.exitPoint.x - this.entryPoint.x);
      const signYMove = Math.sign(this.exitPoint.y - this.entryPoint.y);
      if ((signXMove > 0 && newPosition.x > this.exitPoint.x) || (signXMove < 0 && newPosition.x < this.exitPoint.x)) {
        newPosition.x = this.exitPoint.x;
      }
      if ((signYMove > 0 && newPosition.y > this.exitPoint.y) || (signYMove < 0 && newPosition.y < this.exitPoint.y)) {
        newPosition.y = this.exitPoint.y;
      }

      this.setPosition(newPosition);

      if (newPosition.equal(this.exitPoint)) {
        this.onExitTile();
      }
    }
  }
}

module.exports = Car;
