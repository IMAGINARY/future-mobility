const EventEmitter = require('events');
const { getTileTypeId } = require('../lib/config-helpers');
const Array2D = require('../lib/array-2d');
const MapTextOverlay = require('../map-text-overlay');
const TravelTimeCalculator = require('../lib/travel-times');

class MeasureDistanceTool {
  constructor(config, mapEditorController) {
    this.config = config;
    this.mapEditorController = mapEditorController;
    this.events = new EventEmitter();

    this.mapView = mapEditorController.mapView;
    this.textOverlay = new MapTextOverlay(this.mapView);
    this.travelTimeCalculator = new TravelTimeCalculator(this.config);

    this.mapEditorController.addTool('measureDistance', this);
  }

  onStart() {
    this.mapView.setInspectCursor();
    this.textOverlay.clear();
    this.textOverlay.show();
  }

  onEnd() {
    this.textOverlay.hide();
  }

  onAction([startX, startY]) {
    const data = this.travelTimeCalculator
      .travelTimes(this.mapView.city.map, [startX, startY]);
    this.textOverlay.display(data);

    const residentalId = getTileTypeId(this.config, 'residential');
    const commercialId = getTileTypeId(this.config, 'commercial');
    const industrialId = getTileTypeId(this.config, 'industrial');
    Array2D.zip(data, this.mapView.city.map.cells, (value, tile, x, y) => {
      data[y][x] = (
        (tile === residentalId || tile === commercialId || tile === industrialId)
          ? value : null
      );
    });

    this.mapEditorController.notifyDataToInspectors(
      `Trip len from (${startX}, ${startY}) to RCI`,
      Array2D.flatten(data).filter((v) => v !== null)
    );
  }
}

module.exports = MeasureDistanceTool;
