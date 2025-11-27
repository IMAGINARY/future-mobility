/* global PIXI */
const MeasureDistanceTool = require('../editor/fms-measure-distance-tool');
const ShowMappedVariableTool = require('../editor/show-mapped-variable-tool');

function injectMapEditorExtensions(config, mapView, stats, mapEditorController, mapEditorPalette) {
  // eslint-disable-next-line no-unused-vars
  const measureDistanceTool = new MeasureDistanceTool(config, mapEditorController);
  // const mappedVariableTool = new ShowMappedVariableTool(config, mapEditorController, stats);
  // PIXI.Ticker.shared.add((time) => mappedVariableTool.animate(time));
}

module.exports = injectMapEditorExtensions;
