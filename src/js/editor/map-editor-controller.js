const EventEmitter = require('events');
const City = require('../city');
const ModalLoad = require('./modal-load');
const ModalSave = require('./modal-save');
const ModalExport = require('./modal-export');
const ModalImport = require('./modal-import');
const ObjectStore = require('./object-store');
const MapTextOverlay = require('../map-text-overlay');
const { getTileTypeId } = require('../lib/config-helpers');
const Array2D = require('../lib/array-2d');
const VariableMapOverlay = require('../variable-map-overlay');
const TravelTimeCalculator = require('../lib/travel-times');

class MapEditorController {
  constructor(config, mapView, dataManager) {
    this.config = config;
    this.mapView = mapView;
    this.dataManager = dataManager;

    this.events = new EventEmitter();

    this.textOverlay = new MapTextOverlay(this.mapView);
    this.variableMapOverlay = new VariableMapOverlay(this.mapView, this.config);
    this.travelTimeCalculator = new TravelTimeCalculator(this.config);

    this.tool = 'nullTool';
    this.tileType = null;
    let lastEdit = null;

    this.mapView.events.on(
      'action',
      (...args) => this.tools[this.tool].action(...args)
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

    this.tools = {
      nullTool: {
        start: () => {},
        end: () => {},
        action: () => {},
      },
      tile: {
        start: () => {
          this.mapView.setEditCursor();
        },
        end: () => {

        },
        action: ([x, y], props) => {
          if (this.tileType !== null) {
            if (lastEdit && props.shiftKey) {
              const [lastX, lastY] = lastEdit;
              for (let i = Math.min(lastX, x); i <= Math.max(lastX, x); i += 1) {
                for (let j = Math.min(lastY, y); j <= Math.max(lastY, y); j += 1) {
                  this.mapView.city.map.set(i, j, this.tileType);
                }
              }
            } else {
              this.mapView.city.map.set(x, y, this.tileType);
            }
            lastEdit = [x, y];
          }
        },
      },
      measureDistance: {
        start: () => {
          this.mapView.setInspectCursor();
          this.textOverlay.clear();
          this.textOverlay.show();
        },
        end: () => {
          this.textOverlay.hide();
        },
        action: ([startX, startY]) => {
          const data = this.travelTimeCalculator
            .travelTimes(this.mapView.city.map, [startX, startY]);
          this.textOverlay.display(data);

          const residentalId = getTileTypeId(config, 'residential');
          const commercialId = getTileTypeId(config, 'commercial');
          const industrialId = getTileTypeId(config, 'industrial');
          Array2D.zip(data, this.mapView.city.map.cells, (value, tile, x, y) => {
            data[y][x] = (
              (tile === residentalId || tile === commercialId || tile === industrialId)
                ? value : null
            );
          });

          this.events.emit('inspect', {
            title: `Trip len from (${startX}, ${startY}) to RCI`,
            values: Array2D.flatten(data).filter(v => v !== null),
          });
        },
      },
      showPollution: {
        start: () => {
          this.mapView.setInspectCursor();
          this.variableMapOverlay.show(
            this.dataManager.get('pollution-map'),
            this.config.variableMapOverlay.colors.pollution,
          );
        },
        end: () => {
          this.variableMapOverlay.hide();
        },
        action: () => {},
      },
      showNoise: {
        start: () => {
          this.mapView.setInspectCursor();
          this.variableMapOverlay.show(
            this.dataManager.get('noise-map'),
            this.config.variableMapOverlay.colors.noise,
          );
        },
        end: () => {
          this.variableMapOverlay.hide();
        },
        action: () => {},
      },
    };

    this.mapView.enableTileInteractivity();
  }

  activateTool(tool, toolType = null) {
    if (this.tool) {
      this.tools[this.tool].end();
    }
    this.tool = tool;
    this.tileType = toolType;
    this.tools[this.tool].start();
  }

  runAction(id) {
    if (this.actionHandlers[id]) {
      this.actionHandlers[id]();
    } else {
      console.warn(`No action handler for "${id}" defined.`);
    }
  }

  animate(time) {
    this.variableMapOverlay.animate(time);
  }
}

module.exports = MapEditorController;
