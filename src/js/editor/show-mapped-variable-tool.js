const VariableMapOverlay = require('../variable-map-overlay');

class ShowMappedVariableTool {
  constructor(config, mapEditorController, dataManager) {
    this.config = config;
    this.mapEditorController = mapEditorController;
    this.dataManager = dataManager;
    this.mapView = this.mapEditorController.mapView;
    this.variableMapOverlay = new VariableMapOverlay(this.mapView, this.config);

    this.mapEditorController.addTool('showMappedVar', this);
  }

  onStart({ variableName, color }) {
    this.mapView.setInspectCursor();
    this.variableMapOverlay.show(this.dataManager.get(variableName), color);
  }

  onEnd() {
    this.variableMapOverlay.hide();
  }

  animate(time) {
    this.variableMapOverlay.animate(time);
  }
}

module.exports = ShowMappedVariableTool;
