const EventEmitter = require('events');
const City = require('../model/city');
const ModalLoad = require('./modal-load');
const ModalSave = require('./modal-save');
const ModalExport = require('./modal-export');
const ModalImport = require('./modal-import');
const ObjectStore = require('./object-store');
const TileTool = require('./tile-tool');
const { logger } = require('../helpers/logger');
const Array2D = require('../data/array-2d');

class MapEditorController {
  constructor(config, mapView, dataManager) {
    this.config = config;
    this.mapView = mapView;
    this.dataManager = dataManager;

    this.events = new EventEmitter();
    this.currTool = null;

    this.mapView.events.on(
      'action',
      (...args) => {
        if (this.currTool && this.currTool.onAction) {
          this.currTool.onAction(...args);
        }
      }
    );

    this.objectStore = new ObjectStore('./data/cities.json');
    this.actionHandlers = {
      load: () => {
        const modal = new ModalLoad(this.config, this.objectStore);
        modal.show().then((id) => {
          const jsonCity = id && this.objectStore.get(id);
          if (jsonCity) {
            this.mapView.city.copy(City.fromJSON(jsonCity));
          }
        });
      },
      save: () => {
        const modal = new ModalSave(this.config, this.objectStore);
        modal.show().then((id) => {
          if (id) {
            this.objectStore.set(id === 'new' ? null : id, this.mapView.city.toJSON());
          }
        });
      },
      import: () => {
        const modal = new ModalImport();
        modal.show().then((importedData) => {
          if (importedData) {
            this.mapView.city.copy(City.fromJSON(importedData));
          }
        });
      },
      export: () => {
        const modal = new ModalExport(JSON.stringify(this.mapView.city));
        modal.show();
      },
    };

    this.tools = {};
    this.addTool('tile', new TileTool(this.config, this));
    this.mapView.enableTileInteractivity();
  }

  addTool(id, tool) {
    logger.debug(`MapEditorController: Adding tool "${id}"`);
    if (this.hasTool(id)) {
      throw new Error(`Attempted to add tool with existing id "${id}" to MapEditorController.`);
    }
    this.tools[id] = tool;
    this.events.emit('toolAdded', id);
  }

  hasTool(toolId) {
    return !!this.tools[toolId];
  }

  addAction(id, handler) {
    logger.debug(`MapEditorController: Adding action "${id}"`);
    if (this.hasAction(id)) {
      throw new Error(`Attempted to add action with existing id "${id}" to MapEditorController.`);
    }
    this.actionHandlers[id] = handler;
    this.events.emit('actionAdded', id);
  }

  hasAction(actionId) {
    return !!this.actionHandlers[actionId];
  }

  activateTool(toolId, props = null) {
    logger.debug(`MapEditorController: Activating tool "${toolId}" with props:`, props);
    if (!this.hasTool(toolId)) {
      throw new Error(`Attempted to activate undefined "${toolId}" tool.`);
    }
    if (this.currTool && this.currTool.onEnd) {
      this.currTool.onEnd();
    }
    this.events.emit('toolActivated', toolId, props);
    this.currTool = this.tools[toolId];
    if (this.currTool.onStart) {
      this.currTool.onStart(props || {});
    }
  }

  runAction(id) {
    logger.debug(`MapEditorController: Running action "${id}"`);
    if (this.hasAction(id)) {
      this.events.emit('actionRun', id);
      this.actionHandlers[id]();
    } else {
      throw new Error(`Attempted to run undefined "${id}" action.`);
    }
  }

  notifyDataToInspectors(title, values) {
    this.events.emit('inspect', { title, values });
  }
}

module.exports = MapEditorController;
