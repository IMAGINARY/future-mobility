/* globals PIXI */

const MapView = require('./map-view');
const Array2D = require('./lib/array-2d');

class MapTextOverlay {
  constructor(mapView) {
    this.mapView = mapView;
    this.visible = false;
    this.fontSize = (18 / 72) * MapView.TILE_SIZE;
    this.texts = Array2D.create(
      this.mapView.city.map.width,
      this.mapView.city.map.height,
      null
    );

    this.displayObject = new PIXI.Container();
    this.displayObject.visible = this.visible;
    this.displayObject.zIndex = 1000;
    this.mapView.addOverlay(this.displayObject);
    this.createBackground();
    this.createTexts();
  }

  createBackground() {
    const background = new PIXI.Graphics();
    background.beginFill(0, 0.75)
      .drawRect(0, 0, this.mapView.displayObject.width, this.mapView.displayObject.height)
      .endFill();
    this.displayObject.addChild(background);
  }

  createTexts() {
    Array2D.fill(this.texts, (x, y) => {
      const text = new PIXI.Text('', {
        fontFamily: 'Arial',
        fontSize: this.fontSize,
        fill: 'white',
        align: 'center',
      });
      text.anchor.set(0.5, 0.5);
      text.position.set(
        MapView.TILE_SIZE * (x + 0.5),
        MapView.TILE_SIZE * (y + 0.5)
      );
      this.displayObject.addChild(text);
      return text;
    });
  }

  clear() {
    Array2D.forEach(this.texts, (each) => { each.text = ''; });
  }

  display(data) {
    Array2D.zip(this.texts, data, (eachText, eachDataItem) => {
      eachText.text = typeof eachDataItem === 'number' ? eachDataItem.toFixed(2) : eachDataItem;
    });
  }

  show() {
    this.visible = true;
    this.displayObject.visible = true;
  }

  hide() {
    this.visible = false;
    this.displayObject.visible = false;
  }
}

module.exports = MapTextOverlay;
