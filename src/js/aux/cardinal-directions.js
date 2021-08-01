const all = ['N', 'E', 'S', 'W'];

function opposite(direction) {
  return {
    N: 'S', E: 'W', S: 'N', W: 'E',
  }[direction];
}

function ccw(direction) {
  return {
    N: 'W', E: 'N', S: 'E', W: 'S',
  }[direction];
}

function cw(direction) {
  return {
    N: 'E', E: 'S', S: 'W', W: 'N',
  }[direction];
}

function asVector(direction) {
  return {
    N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0],
  }[direction];
}

function asAngle(direction) {
  return {
    N: Math.PI, E: Math.PI * 1.5, S: 0, W: Math.PI * 0.5,
  }[direction];
}

function adjCoords(x, y, direction) {
  const [dx, dy] = asVector(direction);
  return [x + dx, y + dy];
}

module.exports = {
  all,
  opposite,
  ccw,
  cw,
  asVector,
  asAngle,
  adjCoords,
};
