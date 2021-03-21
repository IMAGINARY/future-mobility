export default class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.items = Array.apply(null, Array(width * height)).map(() => 0);
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
  }
}
