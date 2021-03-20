import EventEmitter from 'events';

export default class MapView {
  constructor($element, city, config) {
    this.$element = $element;
    this.city = city;
    this.config = config;
    this.events = new EventEmitter();

    this.$element.addClass('map-view');

    const mapWidth = 1;
    const mapHeight = this.city.height / this.city.width;
    this.$map = $('<div class="city-map"></div>')
      .css({
        width: `${mapWidth * 100}%`,
        height: 0,
        paddingBottom: `${mapHeight * 100}%`,
      })
      .appendTo(this.$element);

    const tileWidth = mapWidth / this.city.width;
    const tileHeight = mapHeight / this.city.height;
    this.$tiles = this.city.items.map(() => $('<div class="city-map-tile"></div>')
      .css({
        width: `${tileWidth * 100}%`,
        height: `${tileHeight * 100}%`,
      }));
    for (let i = 0; i < this.city.width; i += 1) {
      for (let j = 0; j < this.city.height; j += 1) {
        this.$tiles[this.city.offset(i, j)].css({
          top: `${j * tileHeight * 100}%`,
          left: `${i * tileWidth * 100}%`,
        }).on('click', () => {
          this.events.emit('click', [i, j]);
        });
        this.renderTile(i, j);
      }
    }
    this.$map.append(this.$tiles);
  }

  renderTile(i, j) {
    const offset = this.city.offset(i, j);
    this.$tiles[offset].css({
      backgroundColor: this.config.tileTypes[this.city.items[offset]]
        ? this.config.tileTypes[this.city.items[offset]].color
        : null,
    });
  }
}
