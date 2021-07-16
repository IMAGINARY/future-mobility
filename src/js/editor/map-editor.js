import City from '../city.js';
import MapView from '../map-view.js';
import MapEditorPalette from './map-editor-palette.js';
import ModalLoad from './modal-load.js';
import ModalSave from './modal-save.js';
import ModalExport from './modal-export.js';
import ModalImport from './modal-import.js';
import ObjectStore from './object-store.js';

export default class MapEditor {
  constructor($element, city, config, textures) {
    this.$element = $element;
    this.city = city;
    this.config = config;

    this.mapView = new MapView(city, config, textures);
    this.displayObject = this.mapView.displayObject;

    this.palette = new MapEditorPalette($('<div></div>').appendTo(this.$element), config);

    this.tileType = this.palette.tileId;
    this.palette.events.on('change', (tileType) => {
      this.tileType = tileType;
    });

    this.palette.events.on('action', (id) => {
      if (this.actionHandlers[id]) {
        this.actionHandlers[id]();
      }
    });

    let lastEdit = null;
    this.mapView.events.on('action', ([x, y], props) => {
      if (this.tileType) {
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
    });

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
  }
}
