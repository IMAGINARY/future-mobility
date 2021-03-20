export default class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.items = Array.apply(null, Array(width * height)).map(() => 0);
  }

  offset(i, j) {
    return j * this.width + i;
  }

  set(i, j, value) {
    this.items[this.offset(i, j)] = value;
  }
}
