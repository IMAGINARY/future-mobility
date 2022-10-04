const Vec2 = require('vec2');
const Dir = require('../lib/cardinal-directions');
const RoadTile = require('./road-tile');

class PathArc {
  constructor(lane, entrySide, exitSide) {
    this.arcRotation = RoadTile.curveRotation(entrySide, exitSide);

    const rotationDir = RoadTile.curveRotDir(entrySide, exitSide);
    this.rotationSign = rotationDir === 'cw' ? 1 : -1;
    this.arcRadius = RoadTile.curveRadius[rotationDir][lane];
    this.arcLength = Math.PI * this.arcRadius / 2;
    this.rotCenter = RoadTile.curveCenter(entrySide, exitSide);

    this.distance = 0;
    this.progress = 0;
    this.remainder = 0;
    this.position = RoadTile.entryPoint(lane, entrySide);
  }

  advance(distance) {
    this.distance += distance;
    if (this.distance > this.arcLength) {
      this.remainder = this.distance - this.arcLength;
      this.distance = this.arcLength;
    }
    this.progress = this.distance / this.arcLength;
    const angle = this.arcRotation + this.progress * (Math.PI / 2) * this.rotationSign;
    this.position = Vec2(0, this.arcRadius)
      .rotate(angle)
      .add(this.rotCenter);
    this.rotation = angle + Math.PI / 2 * this.rotationSign;
  }
}

module.exports = PathArc;
