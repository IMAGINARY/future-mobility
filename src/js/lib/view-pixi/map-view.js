/* globals PIXI */
const EventEmitter = require('events');
const Array2D = require('../data/array-2d');
const PencilCursor = require('../../../../static/fa/pencil-alt-solid.svg');
const SolidColorTileRenderer = require('../tile-renderers/solid-color-tile-renderer');
const shallowEqual = require('../data/shallow-equal');
const { logger } = require('../helpers/logger');

class MapView {
  constructor(city, config, textures) {
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new EventEmitter();
    this.tileRenderers = {};
    this.defaultTileRenderer = this.createDefaultTileRenderer();
    this.mapState = Array2D.create(this.city.map.width, this.city.map.height, null);
    this.stagingMapState = Array2D.create(this.city.map.width, this.city.map.height, null);
    this.mapStateUpdated = true;

    this.randomizedTerrain = Array2D.create(this.city.map.width, this.city.map.height);
    Array2D.fill(this.randomizedTerrain, () => Math.random());

    this.displayObject = new PIXI.Container();
    // PIXI.ColorMatrixFilter is not deprecated, as far as I can tell...
    this.colorMatrix = new PIXI.ColorMatrixFilter();
    this.displayObject.filters = [this.colorMatrix];

    this.bgTiles = Array2D.create(this.city.map.width, this.city.map.height, null);
    this.textureTiles = Array2D.create(this.city.map.width, this.city.map.height, null);

    this.city.map.allCells().forEach(([x, y]) => {
      const bgTile = new PIXI.Graphics();
      bgTile.x = x * MapView.TILE_SIZE;
      bgTile.y = y * MapView.TILE_SIZE;
      this.bgTiles[y][x] = bgTile;

      const textureTile = new PIXI.Sprite();
      textureTile.x = x * MapView.TILE_SIZE + MapView.TILE_SIZE / 2;
      textureTile.y = y * MapView.TILE_SIZE + MapView.TILE_SIZE / 2;
      textureTile.width = MapView.TILE_SIZE;
      textureTile.height = MapView.TILE_SIZE;
      textureTile.pivot.set(MapView.TILE_SIZE / 2, MapView.TILE_SIZE / 2);
      textureTile.roundPixels = true;
      this.textureTiles[y][x] = textureTile;
    });

    this.zoningLayer = new PIXI.Container();
    this.zoningLayer.addChild(...Array2D.flatten(this.bgTiles));
    this.displayObject.addChild(this.zoningLayer);
    this.tileTextureLayer = new PIXI.Container();
    this.tileTextureLayer.addChild(...Array2D.flatten(this.textureTiles));
    this.displayObject.addChild(this.tileTextureLayer);
    this.overlayContainer = new PIXI.Container();
    this.displayObject.addChild(this.overlayContainer);
    this.gridOverlay = this.createGridOverlay();
    this.displayObject.addChild(this.gridOverlay);
    if (this.config.mapView && this.config.mapView.gridOverlay) {
      this.renderGrid(this.config.mapView.gridOverlay);
    }

    this.city.events.on('update', () => { this.scheduleRender(); });
    this.render();
  }

  createDefaultTileRenderer() {
    // Get the colors for each tile type
    const colorMap = Object.fromEntries(
      Object.entries(this.config.tileTypes)
        .map(([type, def]) => {
          if (def.color === undefined) {
            throw new Error(`Tile type ${type} is missing a color definition`);
          }

          return [type, Number(`0x${def.color.substr(1)}`)]; // Remove leading '#'
        })
    );
    return new SolidColorTileRenderer(this, colorMap);
  }

  addOverlay(displayObject) {
    this.overlayContainer.addChild(displayObject);
    this.overlayContainer.sortChildren();
  }

  createGridOverlay() {
    const overlay = new PIXI.Graphics();
    overlay.x = 0;
    overlay.y = 0;
    overlay.width = this.city.map.width * MapView.TILE_SIZE;
    overlay.height = this.city.map.height * MapView.TILE_SIZE;

    return overlay;
  }

  setEditCursor() {
    Array2D.items(this.bgTiles).forEach(([,, bgTile]) => {
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
    });
  }

  setInspectCursor() {
    Array2D.items(this.bgTiles).forEach(([,, bgTile]) => {
      bgTile.cursor = 'crosshair';
    });
  }

  getCoordsAtPosition(globalPoint) {
    if (this.origin === undefined) {
      this.origin = new PIXI.Point();
    }
    this.origin = this.displayObject.getGlobalPosition(this.origin, false);

    const x = Math.floor((globalPoint.x - this.origin.x)
      / this.displayObject.scale.x / MapView.TILE_SIZE);
    const y = Math.floor((globalPoint.y - this.origin.y)
      / this.displayObject.scale.y / MapView.TILE_SIZE);

    return (x >= 0 && x < this.city.map.width && y >= 0 && y < this.city.map.height)
      ? { x, y } : null;
  }

  enableTileInteractivity() {
    const pointers = {};

    Array2D.items(this.bgTiles).forEach(([x, y, bgTile]) => {
      bgTile.interactive = true;
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
      bgTile.on('pointerdown', (ev) => {
        // this.pointerActive = true;
        pointers[ev.data.pointerId] = { lastTile: { x, y } };
        this.events.emit('action', [x, y], {
          type: 'down',
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
    });

    this.zoningLayer.interactive = true;
    this.zoningLayer.on('pointermove', (ev) => {
      if (pointers[ev.data.pointerId] !== undefined) {
        const tileCoords = this.getCoordsAtPosition(ev.data.global);
        if (pointers[ev.data.pointerId].lastTile !== tileCoords) {
          if (tileCoords) {
            this.events.emit('action', [tileCoords.x, tileCoords.y], {
              type: 'move',
              shiftKey: ev.data.originalEvent.shiftKey,
            });
          }
          pointers[ev.data.pointerId].lastTile = tileCoords;
        }
      }
    });

    const onEndPointer = (ev) => {
      delete pointers[ev.data.pointerId];
    };

    this.zoningLayer.on('pointerup', onEndPointer);
    this.zoningLayer.on('pointerupoutside', onEndPointer);
    this.zoningLayer.on('pointercancel', onEndPointer);
  }

  /**
   * Registers a tile renderer for a specific type of tile.
   *
   * Existing renderers are pushed to a stack.
   * @param {string} type
   * @param {object} renderer
   */
  addTileTypeRenderer(type, renderer) {
    if (this.tileRenderers[type] === undefined) {
      this.tileRenderers[type] = [];
    }
    this.tileRenderers[type].push(renderer);
  }

  /**
   * Removes a tile renderer for a specific type of tile.
   *
   * @param {string} type
   * @param {object} renderer
   */
  removeTileTypeRenderer(type, renderer) {
    if (this.tileRenderers[type] !== undefined) {
      const index = this.tileRenderers[type].indexOf(renderer);
      if (index !== -1) {
        this.tileRenderers[type].splice(index, 1);
      }
    }
  }

  getBgTile(x, y) {
    return this.bgTiles[y][x];
  }

  getTextureTile(x, y) {
    return this.textureTiles[y][x];
  }

  renderTile(x, y, props) {
    if (props.bgColor !== undefined) {
      this.getBgTile(x, y)
        .clear()
        .beginFill(props.bgColor, 1)
        .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
        .endFill();
    }
    if (props.bgColor1 !== undefined && props.bgColor2 !== undefined) {
      // Todo: This rendering option should be deprecated when possible.
      //   Right now it only exists to support the dense-city power-up.
      //   Once the FMS uses tile orientation, we can use oriented textures
      //   to color buildings within the residential and commercial tiles using
      //   different colors instead of doing this kind of pattern fill.
      this.getBgTile(x, y)
        .clear()
        .beginFill(props.bgColor1, 1)
        .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
        .beginFill(props.bgColor2, 1)
        .drawRect(
          MapView.TILE_SIZE / 2,
          MapView.TILE_SIZE / 2,
          MapView.TILE_SIZE / 2,
          MapView.TILE_SIZE / 2
        )
        .endFill();
    }
    if (props.bundle && props.texture) {
      const textureTile = this.getTextureTile(x, y);
      textureTile.texture = this.getTexture(props.bundle, props.texture);
      textureTile.angle = props.textureAngle || 0;

      this.getTextureTile(x, y).visible = true;
    } else {
      this.getTextureTile(x, y).visible = false;
    }
  }

  getTexture(type, id) {
    const texture = this.textures?.[type]?.[id];
    if (!texture) {
      throw new Error(`Missing texture: ${type} / ${id}`);
    }
    return texture;
  }

  renderGrid(strokeWidth) {
    const viewWidth = this.city.map.width * MapView.TILE_SIZE;
    const viewHeight = this.city.map.height * MapView.TILE_SIZE;
    this.gridOverlay.clear();
    this.gridOverlay
      .lineStyle(strokeWidth / 2, 0, 1, 1)
      .moveTo(strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, strokeWidth / 2)
      .lineTo(viewWidth - strokeWidth / 2, strokeWidth / 2)
      .lineTo(viewWidth - strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, viewHeight - strokeWidth / 2)
      .lineTo(strokeWidth / 2, viewHeight - strokeWidth);

    this.gridOverlay.lineStyle(strokeWidth, 0, 1);
    for (let i = 1; i < this.city.map.width; i += 1) {
      this.gridOverlay.moveTo(i * MapView.TILE_SIZE, strokeWidth / 2)
        .lineTo(i * MapView.TILE_SIZE, viewHeight - strokeWidth / 2);
    }
    for (let i = 1; i < this.city.map.height; i += 1) {
      this.gridOverlay.moveTo(strokeWidth / 2, i * MapView.TILE_SIZE)
        .lineTo(viewWidth - strokeWidth / 2, i * MapView.TILE_SIZE);
    }
  }

  updateStagingMapState() {
    this.city.map.allCells().forEach(([x, y]) => {
      const cellType = this.city.getCellType(x, y);
      const cellOrientation = this.city.getCellOrientation(x, y);
      const renderer = (this.tileRenderers?.[cellType]?.slice(-1)[0]) || this.defaultTileRenderer;
      this.stagingMapState[y][x] = renderer.render(cellType, x, y, cellOrientation);
    });
  }

  scheduleRender() {
    this.mapStateUpdated = true;
  }

  render() {
    if (this.mapStateUpdated) {
      logger.debug('Rendering map updates');
      this.updateStagingMapState();
      let updatedTiles = 0;
      this.city.map.allCells().forEach(([x, y]) => {
        if (!shallowEqual(this.stagingMapState[y][x], this.mapState[y][x])) {
          // Render only changed tiles
          this.mapState[y][x] = this.stagingMapState[y][x];
          this.renderTile(x, y, this.mapState[y][x]);
          updatedTiles += 1;
        }
      });
      logger.debug(`Rendered ${updatedTiles} updated tiles`);
      // Swap staging and current state
      const temp = this.mapState;
      this.mapState = this.stagingMapState;
      this.stagingMapState = temp;
      this.mapStateUpdated = false;
    }
  }

  showGrid() {
    this.gridOverlay.visible = true;
  }

  hideGrid() {
    this.gridOverlay.visible = false;
  }

  disableColors() {
    this.colorMatrix.desaturate();
  }

  enableColors() {
    this.colorMatrix.reset();
  }

  animate() {
    this.render();
  }
}

MapView.TILE_SIZE = 72;

module.exports = MapView;
