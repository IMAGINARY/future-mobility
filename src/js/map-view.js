/* globals PIXI */
import EventEmitter from 'events';
import PencilCursor from '../../static/fa/pencil-alt-solid.svg';

const ROAD_TILE = '1';
const TILE_SIZE = 120;

export default class MapView {
  constructor(city, config, textures) {
    this.displayObject = new PIXI.Container();
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new EventEmitter();

    this.bgTiles = Array(this.city.map.width * this.city.map.height);
    this.textureTiles = Array(this.city.map.width * this.city.map.height);

    let pointerActive = false;
    $(window).on('mouseup', () => { pointerActive = false; });

    this.city.map.allCells().forEach(([i, j]) => {
      const bgTile = new PIXI.Graphics();
      bgTile.x = i * TILE_SIZE;
      bgTile.y = j * TILE_SIZE;
      bgTile.interactive = true;
      bgTile.on('mousedown', (ev) => {
        pointerActive = true;
        this.events.emit('action', [i, j], {
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
      bgTile.on('mouseover', (ev) => {
        if (pointerActive) {
          this.events.emit('action', [i, j], {
            shiftKey: ev.data.originalEvent.shiftKey,
          });
        }
      });
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
      this.bgTiles[this.city.map.offset(i, j)] = bgTile;

      const textureTile = new PIXI.Sprite();
      textureTile.x = i * TILE_SIZE;
      textureTile.y = j * TILE_SIZE;
      textureTile.width = TILE_SIZE;
      textureTile.height = TILE_SIZE;
      textureTile.roundPixels = true;
      this.textureTiles[this.city.map.offset(i, j)] = textureTile;
      this.renderTile(i, j);
    });

    this.displayObject.addChild(...this.bgTiles);
    this.displayObject.addChild(...this.textureTiles);
    this.city.map.events.on('update', this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
  }

  getBgTile(i, j) {
    return this.bgTiles[this.city.map.offset(i, j)];
  }

  getTextureTile(i, j) {
    return this.textureTiles[this.city.map.offset(i, j)];
  }

  renderTile(i, j) {
    this.renderBasicTile(i, j);
    if (this.city.map.get(i, j) === ROAD_TILE) {
      this.renderRoadTile(i, j);
    }
  }

  renderRoadTile(i, j) {
    const connMask = [[i, j - 1], [i + 1, j], [i, j + 1], [i - 1, j]]
      .map(([x, y]) => (!this.city.map.isValidCoords(x, y)
      || this.city.map.get(x, y) === ROAD_TILE
        ? '1' : '0')).join('');
    this.getTextureTile(i, j).texture = this.textures[`road${connMask}`];
    this.getTextureTile(i, j).visible = true;
  }

  renderBasicTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    this.getBgTile(i, j)
      .clear()
      .beginFill(tileType ? Number(`0x${tileType.color.substr(1)}`) : 0, 1)
      .drawRect(0, 0, TILE_SIZE, TILE_SIZE)
      .endFill();
    this.getTextureTile(i, j).visible = false;
  }

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
      // Todo: This should be optimized so it's not called twice per frame for the same tile.
      this.city.map.adjacentCells(i, j)
        .filter(([x, y]) => this.city.map.get(x, y) === ROAD_TILE)
        .forEach(([x, y]) => this.renderRoadTile(x, y));
    });
  }
}
