const Vec2 = require('vec2');
const RoadTile = require('./road-tile');
const Dir = require('../aux/cardinal-directions');
const MapView = require('../map-view');

class PathStraight {
  constructor(lane, entrySide) {
    this.entryPoint = RoadTile.entryPoint(lane, entrySide);
    this.rotation = Dir.asAngle(Dir.opposite(entrySide));

    this.distance = 0;
    this.progress = 0;
    this.remainder = 0;
    this.position = this.entryPoint;
  }

  advance(distance) {
    this.distance += distance;
    if (this.distance > MapView.TILE_SIZE) {
      this.remainder = this.distance - MapView.TILE_SIZE;
      this.distance = MapView.TILE_SIZE;
    }
    this.progress = this.distance / MapView.TILE_SIZE;

    this.position = Vec2(0, this.distance).rotate(this.rotation).add(this.entryPoint);
  }
}

module.exports = PathStraight;
