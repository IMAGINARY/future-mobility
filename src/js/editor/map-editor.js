const EventEmitter = require('events');
const City = require('../city');
const MapView = require('../map-view');
const MapEditorPalette = require('./map-editor-palette');
const ModalLoad = require('./modal-load');
const ModalSave = require('./modal-save');
const ModalExport = require('./modal-export');
const ModalImport = require('./modal-import');
const ObjectStore = require('./object-store');
const MapTextOverlay = require('../map-text-overlay');
const travelTimes = require('../aux/travel-times');
const { getTileTypeId } = require('../aux/config-helpers');

class MapEditor {
  constructor($element, city, config, textures) {
    this.$element = $element;
    this.city = city;
    this.config = config;

    this.events = new EventEmitter();
    this.mapView = new MapView(city, config, textures);
    this.mapView.enableTileInteractivity();
    this.displayObject = this.mapView.displayObject;
    this.textOverlay = new MapTextOverlay(this.mapView);

    this.palette = new MapEditorPalette($('<div></div>').appendTo(this.$element), config);

    this.tool = null;
    this.tileType = this.palette.tileId;
    this.palette.events.on('change', (tool, toolType) => {
      if (this.tool) {
        this.tools[this.tool].end();
      }
      this.tool = tool;
      this.tileType = toolType;
      this.tools[this.tool].start();
    });

    this.palette.events.on('action', (id) => {
      if (this.actionHandlers[id]) {
        this.actionHandlers[id]();
      }
    });

    let lastEdit = null;
    this.mapView.events.on('action',
      (...args) => this.tools[this.tool].action(...args));

    this.objectStore = new ObjectStore('./cities.json');
    this.actionHandlers = {
      load: () => {
        const modal = new ModalLoad(this.config, this.objectStore);
        modal.show().then((id) => {
          const jsonCity = id && this.objectStore.get(id);
          if (jsonCity) {
            this.city.copy(City.fromJSON(jsonCity));
          }
        });
      },
      save: () => {
        const modal = new ModalSave(this.config, this.objectStore);
        modal.show().then((id) => {
          if (id) {
            this.objectStore.set(id === 'new' ? null : id, this.city.toJSON());
          }
        });
      },
      import: () => {
        const modal = new ModalImport();
        modal.show().then((importedData) => {
          if (importedData) {
            this.city.copy(City.fromJSON(importedData));
          }
        });
      },
      export: () => {
        const modal = new ModalExport(JSON.stringify(this.city));
        modal.show();
      },
    };

    this.tools = {
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
                  this.city.map.set(i, j, this.tileType);
                }
              }
            } else {
              this.city.map.set(x, y, this.tileType);
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
        action: ([x, y]) => {
          const roadTileId = getTileTypeId(this.config, 'road');
          const data = travelTimes(this.mapView.city.map, [x, y],
            (tileFrom, tileTo) => (
              (tileFrom === roadTileId && tileTo === roadTileId) ? 1 : 5));
          this.textOverlay.display(data);
          this.events.emit('inspect', {
            title: `Travel times from (${x}, ${y})`,
            values: data,
          });
        },
      },
    };
  }
}

module.exports = MapEditor;
