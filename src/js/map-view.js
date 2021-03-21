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
    this.$tiles = Array(this.city.width * this.city.height);

    let pointerActive = false;
    $(window).on('mouseup', () => { pointerActive = false; });

    this.city.forEach((i, j) => {
      this.$tiles[this.city.offset(i, j)] = $('<div class="city-map-tile"></div>')
        .attr({
          'data-x': i,
          'data-y': j,
        })
        .css({
          width: `${tileWidth * 100}%`,
          height: `${tileHeight * 100}%`,
          top: `${j * tileHeight * 100}%`,
          left: `${i * tileWidth * 100}%`,
        })
        .on('mousedown', () => {
          pointerActive = true;
          this.events.emit('action', [i, j]);
        })
        .on('mouseenter', () => {
          if (pointerActive) {
            this.events.emit('action', [i, j]);
          }
        });
      this.renderTile(i, j);
    });

    this.$map.append(this.$tiles);
  }

  getTile(i, j) {
    return this.$tiles[this.city.offset(i, j)];
  }

  renderTile(i, j) {
    const tileType = this.config.tileTypes[this.city.get(i, j)] || null;
    this.getTile(i, j).css({ backgroundColor: tileType ? tileType.color : null });
  }
}
