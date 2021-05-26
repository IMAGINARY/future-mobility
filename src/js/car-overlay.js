/* globals PIXI */

const ROAD_TILE = '1';
const TILE_SIZE = 120;

export default class CarOverlay {
  constructor(city, config, textures) {
    this.displayObject = new PIXI.Container();
    this.displayObject.width = 1920;
    this.displayObject.height = 1920;
    this.displayObject.x = 0;
    this.displayObject.y = 0;
    this.city = city;
    this.config = config;
    this.textures = textures;

    this.cars = [{
      tileX: 5,
      tileY: 0,
      lane: 1,
      dirIn: 'N',
      dirOut: 'S',
      speed: 1,
    }];

    this.carSprite = new PIXI.Sprite();
    [this.carSprite.x, this.carSprite.y] = this.getInCoords(
      this.cars[0].tileX, this.cars[0].tileY, this.cars[0].lane, this.cars[0].dirIn
    );
    this.carSprite.width = 15;
    this.carSprite.height = 33;
    this.carSprite.roundPixels = true;
    this.carSprite.texture = this.textures.car002;
    this.carSprite.anchor.set(0.5);
    this.carSprite.visible = true;

    this.displayObject.addChild(this.carSprite);
  }

  getNextOrders(car) {
    const nextOrders = Object.assign({}, car);
    // Set next tile
    const offsets = {
      N: [0, -1],
      E: [1, 0],
      S: [0, 1],
      W: [-1, 0],
    };
    nextOrders.tileX += offsets[car.dirOut][0];
    nextOrders.tileY += offsets[car.dirOut][1];
    // Check if it's still within the map
    if (!this.city.map.isValidCoords(nextOrders.tileX, nextOrders.tileY)) {
      console.log(`CAR OUT OF BOUNDS ${nextOrders.tileX}, ${nextOrders.tileY}`);
      return null;
    }
    // Set the new dirIn and dirOut
    const opposite = {
      N: 'S', E: 'W', S: 'N', W: 'E',
    };
    const rightTurn = {
      N: 'W', E: 'N', S: 'E', W: 'S',
    };
    const leftTurn = {
      N: 'E', E: 'S', S: 'W', W: 'N',
    };
    nextOrders.dirIn = opposite[car.dirOut];

    // Select the direction based on road availability
    const dirOutChoices = [];
    const isRoad = ([x, y]) => (!this.city.map.isValidCoords(x, y)
      || this.city.map.get(x, y) === ROAD_TILE);
    const adjCoords = (x, y, dir) => [x + offsets[dir][0], y + offsets[dir][1]];

    // If it's possible to go forward, add the option
    if (isRoad(adjCoords(nextOrders.tileX, nextOrders.tileY, opposite[nextOrders.dirIn]))) {
      // Add it three times to make it more likely than turning
      dirOutChoices.push(opposite[nextOrders.dirIn]);
      dirOutChoices.push(opposite[nextOrders.dirIn]);
      dirOutChoices.push(opposite[nextOrders.dirIn]);
    }
    // If it's possible to turn right, add the option
    if (isRoad(adjCoords(nextOrders.tileX, nextOrders.tileY, rightTurn[nextOrders.dirIn]))) {
      dirOutChoices.push(rightTurn[nextOrders.dirIn]);
    }
    // If it's not possible to go forward or turn right,
    // turn left if possible.
    if (dirOutChoices.length === 0
      && isRoad(adjCoords(nextOrders.tileX, nextOrders.tileY, leftTurn[nextOrders.dirIn]))) {
      dirOutChoices.push(leftTurn[nextOrders.dirIn]);
    }
    // There's no way to go
    if (dirOutChoices.length === 0) {
      console.log('NOWHERE TO GO');
      return null;
    }
    // Randomly select one of the possible directions
    nextOrders.dirOut = dirOutChoices[Math.floor(Math.random() * dirOutChoices.length)];

    return nextOrders;
  }

  getInCoords(tileX, tileY, lane, dirIn) {
    let offsetX = 0;
    let offsetY = 0;
    switch (dirIn) {
      case 'W':
        offsetY = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
        break;
      case 'E':
        offsetX = TILE_SIZE;
        offsetY = (TILE_SIZE / 6) * (lane + 0.5);
        break;
      case 'S':
        offsetX = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
        offsetY = TILE_SIZE;
        break;
      case 'N':
        offsetX = (TILE_SIZE / 6) * (lane + 0.5);
        break;
      default:
        throw new Error(`Invalid direction ${dirIn}`);
    }

    return [
      tileX * TILE_SIZE + offsetX,
      tileY * TILE_SIZE + offsetY,
    ];
  }

  getOutCoords(tileX, tileY, lane, dirOut) {
    let offsetX = 0;
    let offsetY = 0;
    switch (dirOut) {
      case 'W':
        offsetY = (TILE_SIZE / 6) * (lane + 0.5);
        break;
      case 'E':
        offsetY = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
        offsetX = TILE_SIZE;
        break;
      case 'S':
        offsetX = (TILE_SIZE / 6) * (lane + 0.5);
        offsetY = TILE_SIZE;
        break;
      case 'N':
        offsetX = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
        break;
      default:
        throw new Error(`Invalid direction ${dirOut}`);
    }

    return [
      tileX * TILE_SIZE + offsetX,
      tileY * TILE_SIZE + offsetY,
    ];
  }

  animate(time) {
    if (this.cars[0] === null) return;

    const [inX, inY] = this.getInCoords(
      this.cars[0].tileX, this.cars[0].tileY,
      this.cars[0].lane, this.cars[0].dirIn,
    );

    const [outX, outY] = this.getOutCoords(
      this.cars[0].tileX, this.cars[0].tileY,
      this.cars[0].lane, this.cars[0].dirOut,
    );

    const percProgress = 1
      - (Math.max(Math.abs(outX - this.carSprite.x), Math.abs(outY - this.carSprite.y))
        / Math.max(Math.abs(outX - inX), Math.abs(outY - inY)));

    const progX = 1 - ((outX - this.carSprite.x) / (outX - inX));
    const progY = 1 - ((outY - this.carSprite.y) / (outY - inY));
    // const percProgress = Math.sqrt(progX * progX + progY * progY);
    const fullDist = Math.sqrt(Math.pow(outX - inX, 2) + Math.pow(outY - inY, 2));
    const currDist = Math.sqrt(Math.pow(outX - this.carSprite.x, 2) + Math.pow(outY - this.carSprite.y, 2));
    const distProg = 1 - currDist / fullDist;

    const opposite = {
      N: 'S', E: 'W', S: 'N', W: 'E',
    };

    const angles = {
      N: Math.PI, E: Math.PI * 1.5, S: 0, W: Math.PI * 0.5,
    };
    const minAngle = (a, b) => (Math.abs(a - b) > Math.PI
      ? (Math.PI * 2 - Math.abs(a - b)) * Math.sign(a - b) * -1
      : a - b);
    // Fix case where angleFrom -> angleTo does 1.5 PI of delta instead of 0.5
    const angleFrom = angles[opposite[this.cars[0].dirIn]];
    const angleTo = angles[this.cars[0].dirOut];
    this.carSprite.rotation = angleFrom + minAngle(angleTo, angleFrom) * distProg;

    const speedX = this.cars[0].dirIn === 'W' || this.cars[0].dirOut === 'E' ? 1
      : (this.cars[0].dirIn === 'E' || this.cars[0].dirOut === 'W' ? -1 : 0);
    const speedY = this.cars[0].dirIn === 'N' || this.cars[0].dirOut === 'S' ? 1
      : (this.cars[0].dirIn === 'S' || this.cars[0].dirOut === 'N' ? -1 : 0);

    this.carSprite.x += Math.sin(this.carSprite.rotation * -1) * this.cars[0].speed * time;
    this.carSprite.y += Math.cos(this.carSprite.rotation * -1) * this.cars[0].speed * time;

    if ((speedY > 0 && this.carSprite.y > outY) || (speedY < 0 && this.carSprite.y < outY)) {
      this.carSprite.y = outY;
    }
    if ((speedX > 0 && this.carSprite.x > outX) || (speedX < 0 && this.carSprite.x < outX)) {
      this.carSprite.x = outX;
    }

    if (this.carSprite.x === outX && this.carSprite.y === outY) {
      // Determine new tile and directions
      this.cars[0] = this.getNextOrders(this.cars[0]);
      if (this.cars[0] !== null) {
        console.log(`Changed tile to ${this.cars[0].tileX}, ${this.cars[0].tileY} ${this.cars[0].dirIn}->${this.cars[0].dirOut}`);
      }
    }
  }
}
