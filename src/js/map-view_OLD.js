/* globals PIXI */
const EventEmitter = require("events");
const Array2D = require("./lib/array-2d");
const { getTileTypeId } = require("./lib/config-helpers");
const PencilCursor = require("../../static/fa/pencil-alt-solid.svg");

class MapView {
  constructor(city, config, textures) {
    this.city = city;
    this.config = config;
    this.textures = textures;
    this.events = new EventEmitter();
    this.roadTileId = getTileTypeId(config, "road");
    this.parkTileId = getTileTypeId(config, "park");
    this.waterTileId = getTileTypeId(config, "water");
    this.roadTextureKey = "roads";
    this.roadTexturePrefix = "road";
    this.basicTileRenderers = {};

    this.randomizedTerrain = Array2D.create(
      this.city.map.width,
      this.city.map.height
    );
    Array2D.fill(this.randomizedTerrain, () => Math.random());

    this.displayObject = new PIXI.Container();

    this.bgTiles = Array2D.create(
      this.city.map.width,
      this.city.map.height,
      null
    );
    this.textureTiles = Array2D.create(
      this.city.map.width,
      this.city.map.height,
      null
    );

    this.city.map.allCells().forEach(([x, y]) => {
      const bgTile = new PIXI.Graphics();
      bgTile.x = x * MapView.TILE_SIZE;
      bgTile.y = y * MapView.TILE_SIZE;
      this.bgTiles[y][x] = bgTile;

      const textureTile = new PIXI.Sprite();
      textureTile.x = x * MapView.TILE_SIZE;
      textureTile.y = y * MapView.TILE_SIZE;
      textureTile.width = MapView.TILE_SIZE;
      textureTile.height = MapView.TILE_SIZE;
      textureTile.roundPixels = true;
      this.textureTiles[y][x] = textureTile;
      this.renderTile(x, y);
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

    this.city.map.events.on("update", this.handleCityUpdate.bind(this));
    this.handleCityUpdate(this.city.map.allCells());
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
    Array2D.items(this.bgTiles).forEach(([, , bgTile]) => {
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
    });
  }

  setInspectCursor() {
    Array2D.items(this.bgTiles).forEach(([, , bgTile]) => {
      bgTile.cursor = "crosshair";
    });
  }

  getCoordsAtPosition(globalPoint) {
    if (this.origin === undefined) {
      this.origin = new PIXI.Point();
    }
    this.origin = this.displayObject.getGlobalPosition(this.origin, false);

    const x = Math.floor(
      (globalPoint.x - this.origin.x) /
        this.displayObject.scale.x /
        MapView.TILE_SIZE
    );
    const y = Math.floor(
      (globalPoint.y - this.origin.y) /
        this.displayObject.scale.y /
        MapView.TILE_SIZE
    );

    return x >= 0 &&
      x < this.city.map.width &&
      y >= 0 &&
      y < this.city.map.height
      ? { x, y }
      : null;
  }

  enableTileInteractivity() {
    const pointers = {};

    Array2D.items(this.bgTiles).forEach(([x, y, bgTile]) => {
      bgTile.interactive = true;
      bgTile.cursor = `url(${PencilCursor}) 0 20, auto`;
      bgTile.on("pointerdown", (ev) => {
        // this.pointerActive = true;
        pointers[ev.data.pointerId] = { lastTile: { x, y } };
        this.events.emit("action", [x, y], {
          shiftKey: ev.data.originalEvent.shiftKey,
        });
      });
    });

    this.zoningLayer.interactive = true;
    this.zoningLayer.on("pointermove", (ev) => {
      if (pointers[ev.data.pointerId] !== undefined) {
        const tileCoords = this.getCoordsAtPosition(ev.data.global);
        if (pointers[ev.data.pointerId].lastTile !== tileCoords) {
          if (tileCoords) {
            this.events.emit("action", [tileCoords.x, tileCoords.y], {
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

    this.zoningLayer.on("pointerup", onEndPointer);
    this.zoningLayer.on("pointerupoutside", onEndPointer);
    this.zoningLayer.on("pointercancel", onEndPointer);
  }

  getBgTile(x, y) {
    return this.bgTiles[y][x];
  }

  getTextureTile(x, y) {
    return this.textureTiles[y][x];
  }

  renderTile(x, y) {
    this.renderBasicTile(x, y);
    if (this.city.map.get(x, y) === this.parkTileId) {
      this.renderParkTile(x, y);
    }
    if (this.city.map.get(x, y) === this.waterTileId) {
      this.renderWaterTile(x, y);
    }
    if (this.city.map.get(x, y) === this.roadTileId) {
      this.renderRoadTile(x, y);
    }
  }

  renderParkTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    this.getTextureTile(x, y).texture =
      this.textures.parks[`park-0${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderWaterTile(x, y) {
    const textureNumber = 1 + Math.round(this.randomizedTerrain[y][x] * 8);
    this.getTextureTile(x, y).texture =
      this.textures.water[`water-0${textureNumber}`];
    this.getTextureTile(x, y).visible = true;
  }

  renderRoadTile(i, j) {
    const connMask = [
      [i, j - 1],
      [i + 1, j],
      [i, j + 1],
      [i - 1, j],
    ]
      .map(([x, y]) =>
        !this.city.map.isValidCoords(x, y) ||
        this.city.map.get(x, y) === this.roadTileId
          ? "1"
          : "0"
      )
      .join("");
    this.getTextureTile(i, j).texture =
      this.textures[this.roadTextureKey][
        `${this.roadTexturePrefix}${connMask}`
      ];
    this.getTextureTile(i, j).visible = true;
  }

  renderBasicTile(i, j) {
    const tileType = this.config.tileTypes[this.city.map.get(i, j)] || null;
    if (this.basicTileRenderers[tileType.type]) {
      this.basicTileRenderers[tileType.type](i, j);
    } else {
      this.getBgTile(i, j)
        .clear()
        .beginFill(tileType ? Number(`0x${tileType.color.substr(1)}`) : 0, 1)
        .drawRect(0, 0, MapView.TILE_SIZE, MapView.TILE_SIZE)
        .endFill();
    }
    this.getTextureTile(i, j).visible = false;
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
      this.gridOverlay
        .moveTo(i * MapView.TILE_SIZE, strokeWidth / 2)
        .lineTo(i * MapView.TILE_SIZE, viewHeight - strokeWidth / 2);
    }
    for (let i = 1; i < this.city.map.height; i += 1) {
      this.gridOverlay
        .moveTo(strokeWidth / 2, i * MapView.TILE_SIZE)
        .lineTo(viewWidth - strokeWidth / 2, i * MapView.TILE_SIZE);
    }
  }

  handleCityUpdate(updates) {
    updates.forEach(([i, j]) => {
      this.renderTile(i, j);
      // Todo: This should be optimized so it's not called twice per frame for the same tile.
      this.city.map
        .adjacentCells(i, j)
        .filter(([x, y]) => this.city.map.get(x, y) === this.roadTileId)
        .forEach(([x, y]) => this.renderRoadTile(x, y));
    });
  }

  showGrid() {
    this.gridOverlay.visible = true;
  }

  hideGrid() {
    this.gridOverlay.visible = false;
  }
}

MapView.TILE_SIZE = 72;

module.exports = MapView;
