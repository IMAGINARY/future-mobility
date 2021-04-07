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
  }

  getTile(i, j) {
    return this.$tiles[this.city.offset(i, j)];
  }

  renderTile(i, j) {
    const tileType = this.config.tileTypes[this.city.get(i, j)] || null;
    this.getTile(i, j)
      .css({ backgroundColor: tileType ? tileType.color : null })
      .removeAttr('data-road-connectivity');
    this.updateRoadTileConnections(i, j);
    this.city.getAdjacentCoords(i, j).forEach(coords => this.updateRoadTileConnections(...coords));
  }

  updateRoadTileConnections(i, j) {
    if (this.city.get(i, j) === ROAD_TILE) {
      this.getTile(i, j).attr('data-road-connectivity',
        Object.values(this.city.getAdjacent(i, j))
          .map(v => (v === ROAD_TILE || v === null ? '1' : '0')).join(''));
    }
  }
}
