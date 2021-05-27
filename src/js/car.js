/* globals PIXI */

const ROAD_TILE = '1';
const TILE_SIZE = 120;

function oppositeSide(side) {
  return {
    N: 'S', E: 'W', S: 'N', W: 'E',
  }[side];
}

function rightTurn(side) {
  return {
    N: 'W', E: 'N', S: 'E', W: 'S',
  }[side];
}

function leftTurn(side) {
  return {
    N: 'E', E: 'S', S: 'W', W: 'N',
  }[side];
}

function sideOffset(side) {
  return {
    N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0],
  }[side];
}

function sideAngle(side) {
  return {
    N: Math.PI, E: Math.PI * 1.5, S: 0, W: Math.PI * 0.5,
  }[side];
}


const adjTile = (i, j, side) => [i + sideOffset(side)[0], j + sideOffset(side)[1]];

function tileInCoords(i, j, lane, side) {
  const offset = [0, 0];
  switch (side) {
    case 'W':
      offset[1] = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
      break;
    case 'E':
      offset[0] = TILE_SIZE;
      offset[1] = (TILE_SIZE / 6) * (lane + 0.5);
      break;
    case 'S':
      offset[0] = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
      offset[1] = TILE_SIZE;
      break;
    case 'N':
      offset[0] = (TILE_SIZE / 6) * (lane + 0.5);
      break;
    default:
      throw new Error(`Invalid direction ${side}`);
  }

  return [
    i * TILE_SIZE + offset[0],
    j * TILE_SIZE + offset[1],
  ];
}

function tileOutCoords(i, j, lane, side) {
  const offset = [0, 0];
  switch (side) {
    case 'W':
      offset[1] = (TILE_SIZE / 6) * (lane + 0.5);
      break;
    case 'E':
      offset[0] = TILE_SIZE;
      offset[1] = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
      break;
    case 'S':
      offset[0] = (TILE_SIZE / 6) * (lane + 0.5);
      offset[1] = TILE_SIZE;
      break;
    case 'N':
      offset[0] = TILE_SIZE - ((TILE_SIZE / 6) * (lane + 0.5));
      break;
    default:
      throw new Error(`Invalid direction ${side}`);
  }

  return [
    i * TILE_SIZE + offset[0],
    j * TILE_SIZE + offset[1],
  ];
}

export default class Car {
  constructor(carOverlay, texture) {
    this.overlay = carOverlay;

    this.active = true;
    this.tile = { i: 5, j: 0 };
    this.lane = 1; // 0: bike path, 1: outer lane, 2: inner lane
    this.sideIn = 'N';
    this.sideOut = 'S';
    this.speed = 1;

    this.sprite = new PIXI.Sprite();
    [this.sprite.x, this.sprite.y] = tileInCoords(
      this.tile.i, this.tile.j, this.lane, this.sideIn
    );
    this.sprite.texture = texture;
    this.sprite.width = texture.baseTexture.width;
    this.sprite.height = texture.baseTexture.height;
    this.sprite.roundPixels = true;
    this.sprite.anchor.set(0.5);
    this.sprite.visible = true;
  }

  randomSideOut() {
    // Select the direction based on road availability
    const sideOutChoices = [];
    const isRoad = (i, j) => (!this.overlay.city.map.isValidCoords(i, j)
      || this.overlay.city.map.get(i, j) === ROAD_TILE);

    // If it's possible to go forward, add the option
    if (isRoad(...adjTile(this.tile.i, this.tile.j, oppositeSide(this.sideIn)))) {
      // Add it three times to make it more likely than turning
      sideOutChoices.push(oppositeSide(this.sideIn));
      sideOutChoices.push(oppositeSide(this.sideIn));
      sideOutChoices.push(oppositeSide(this.sideIn));
    }
    // If it's possible to turn right, add the option
    if (isRoad(...adjTile(this.tile.i, this.tile.j, rightTurn(this.sideIn)))) {
      sideOutChoices.push(rightTurn(this.sideIn));
    }
    // If it's not possible to go forward or turn right,
    // turn left if possible.
    if (sideOutChoices.length === 0
      && isRoad(...adjTile(this.tile.i, this.tile.j, leftTurn(this.sideIn)))) {
      sideOutChoices.push(leftTurn(this.sideIn));
    }
    // There's no way to go
    if (sideOutChoices.length === 0) {
      return null;
    }

    // Randomly select one of the possible directions
    return sideOutChoices[Math.floor(Math.random() * sideOutChoices.length)];
  }

  handleTileExit() {
    // Set next tile
    const newTile = adjTile(this.tile.i, this.tile.j, this.sideOut);
    this.tile = { i: newTile[0], j: newTile[1] };

    // Check if it's still within the map
    if (!this.overlay.city.map.isValidCoords(this.tile.i, this.tile.j)) {
      console.log(`CAR OUT OF BOUNDS ${this.tile.i}, ${this.tile.j}`);
      this.active = false;
      return;
    }

    // Set the new sideIn
    this.sideIn = oppositeSide(this.sideOut);
    this.sideOut = this.randomSideOut();
    if (this.sideOut === null) {
      console.log('NOWHERE TO GO');
      this.active = false;
    }
  }

  animate(time) {
    if (!this.active) return;

    const [inX, inY] = tileInCoords(
      this.tile.i, this.tile.j, this.lane, this.sideIn,
    );

    const [outX, outY] = tileOutCoords(
      this.tile.i, this.tile.j, this.lane, this.sideOut,
    );

    const fullDist = Math.sqrt(((outX - inX) ** 2) + ((outY - inY) ** 2));
    const currDist = Math.sqrt(((outX - this.sprite.x) ** 2) + ((outY - this.sprite.y) ** 2));
    const distProg = 1 - currDist / fullDist;

    const shortestAngle = (angle) => Math.abs(angle) > Math.PI
      ? (Math.PI * 2 - Math.abs(angle)) * Math.sign(angle) * -1
      : angle;

    const angleFrom = sideAngle(oppositeSide(this.sideIn));
    const angleTo = sideAngle(this.sideOut);
    const uglyAdjustment = 1.05;
    this.sprite.rotation = angleFrom
      + shortestAngle(angleTo - angleFrom) * Math.min(distProg * uglyAdjustment, 1);

    this.sprite.x += Math.sin(this.sprite.rotation * -1) * this.speed * time;
    this.sprite.y += Math.cos(this.sprite.rotation * -1) * this.speed * time;

    // Clamp movement so it doesn't go past the target coordinates
    const signXMove = Math.sign(outX - inX);
    const signYMove = Math.sign(outY - inY);
    if ((signXMove > 0 && this.sprite.x > outX) || (signXMove < 0 && this.sprite.x < outX)) {
      this.sprite.x = outX;
    }
    if ((signYMove > 0 && this.sprite.y > outY) || (signYMove < 0 && this.sprite.y < outY)) {
      this.sprite.y = outY;
    }

    // Check if the car exited the tile
    if (this.sprite.x === outX && this.sprite.y === outY) {
      this.handleTileExit();
    }
  }
}
