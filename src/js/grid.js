import EventEmitter from 'events';

export default class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.items = Array.apply(null, Array(width * height)).map(() => 0);
    this.events = new EventEmitter();
  }

  forEach(callback) {
    for (let i = 0; i < this.width; i += 1) {
      for (let j = 0; j < this.height; j += 1) {
        callback(i, j, this.items[j * this.width + i]);
      }
    }
  }

  offset(i, j) {
    return j * this.width + i;
  }

  get(i, j) {
    return this.items[this.offset(i, j)];
  }

  set(i, j, value) {
    this.items[this.offset(i, j)] = value;
    this.events.emit('update', [[i, j, value]]);
  }

  getAdjacentCoords(i, j) {
    return [
      j === 0 ? null : [i, j - 1], // N
      i + 1 >= this.width ? null : [i + 1, j], // E
      j + 1 >= this.height ? null : [i, j + 1], // S
      i === 0 ? null : [i - 1, j], // W
    ].filter(v => v !== null);
  }

  getAdjacent(i, j) {
    return {
      n: j === 0 ? null : this.get(i, j - 1),
      e: i + 1 >= this.width ? null : this.get(i + 1, j),
      s: j + 1 >= this.height ? null : this.get(i, j + 1),
      w: i === 0 ? null : this.get(i - 1, j),
    };
  }

  isValidCoords(i, j) {
    return i >= 0 && j >= 0 && i < this.width && j < this.height;
  }

  getAround(i, j, diameter = 1) {
    const answer = [];
    // Top
    let fixed = j - diameter;
    for (let x = i - diameter; x < i + diameter; x += 1) {
      if (this.isValidCoords(x, fixed)) {
        answer.push([x, fixed, this.get(x, fixed)]);
      }
    }
    // Right
    fixed = i + diameter;
    for (let y = j - diameter; y < j + diameter; y += 1) {
      if (this.isValidCoords(fixed, y)) {
        answer.push([fixed, y, this.get(fixed, y)]);
      }
    }
    // Bottom
    fixed = j + diameter;
    for (let x = i + diameter; x > i - diameter; x -= 1) {
      if (this.isValidCoords(x, fixed)) {
        answer.push([x, fixed, this.get(x, fixed)]);
      }
    }
    // Left
    fixed = i - diameter;
    for (let y = j + diameter; y > j - diameter; y -= 1) {
      if (this.isValidCoords(fixed, y)) {
        answer.push([fixed, y, this.get(fixed, y)]);
      }
    }

    return answer;
  }
}
