import EventEmitter from 'events';

const ROAD_TILE = '1';

export default class MapView {
  constructor($element, city, config) {
    this.$element = $element;
    this.city = city;
    this.config = config;
    this.events = new EventEmitter();

    this.$element.addClass('map-view');

    const mapWidth = 1;
    const mapHeight = this.city.map.height / this.city.map.width;
    this.$map = $('<div class="city-map"></div>')
      .css({
        width: `${mapWidth * 100}%`,
        height: 0,
        paddingBottom: `${mapHeight * 100}%`,
      })
      .appendTo(this.$element);

    const tileWidth = mapWidth / this.city.map.width;
    const tileHeight = mapHeight / this.city.map.height;
    this.$tiles = Array(this.city.map.width * this.city.map.height);

    let pointerActive = false;
    $(window).on('mouseup', () => { pointerActive = false; });

    this.city.map.allCells().forEach(([i, j]) => {
      this.$tiles[this.city.map.offset(i, j)] = $('<div class="city-map-tile"></div>')
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
        .on('mousedown', (ev) => {
          pointerActive = true;
          this.events.emit('action', [i, j], {
            shiftKey: ev.shiftKey,
          });
        })
        .on('mouseenter', (ev) => {
          if (pointerActive) {
            this.events.emit('action', [i, j], {
              shiftKey: ev.shiftKey,
            });
          }
        });
      this.renderTile(i, j);
    });

    this.$map.append(this.$tiles);

    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
  }

  getTile(i, j) {
    return this.$tiles[this.city.map.offset(i, j)];
  }

  renderTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    this.getTile(i, j)
      .css({ backgroundColor: tileType ? tileType.color : null })
      .removeAttr('data-road-connectivity');
    this.updateRoadTileConnections(i, j);
    this.city.map.adjacentCells(i, j)
      .forEach(([x, y]) => this.updateRoadTileConnections(x, y));
  }

  updateRoadTileConnections(i, j) {
    // Todo: This should be optimized so it's not called twice per frame for the same tile.
    if (this.city.map.get(i, j) === ROAD_TILE) {
      this.getTile(i, j).attr('data-road-connectivity',
        [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
          .map(([x, y]) => (!this.city.map.isValidCoords(x, y)
            || this.city.map.get(x, y) === ROAD_TILE
            ? '1' : '0')).join(''));
    }
  }

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => { this.renderTile(i, j); });
  }
}
