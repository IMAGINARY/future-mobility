import MapView from './map-view';
import MapEditorPalette from './map-editor-palette';
import ModalLoad from './modal-load';
import ModalSave from './modal-save';
import ModalExport from './modal-export';
import ModalImport from './modal-import';
import CityStore from './city-store';

export default class MapEditor {
  constructor($element, city, config) {
    this.$element = $element;
    this.city = city;
    this.config = config;

    this.$element.addClass('map-editor');

    this.mapView = new MapView($('<div></div>').appendTo(this.$element), city, config);
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
              this.city.set(i, j, this.tileType);
            }
          }
        } else {
          this.city.set(x, y, this.tileType);
        }
        lastEdit = [x, y];
      }
    });

    this.cityStore = new CityStore();
    this.actionHandlers = {
      load: () => {
        const modal = new ModalLoad(this.config, this.cityStore);
        modal.show().then((id) => {
          const loadedCity = id && this.cityStore.get(id);
          if (loadedCity) {
            this.city.replace(loadedCity.map);
          }
        });
      },
      save: () => {
        const modal = new ModalSave(this.config, this.cityStore);
        modal.show().then((id) => {
          if (id) {
            this.cityStore.set(id === 'new' ? null : id, {
              map: this.city.cells,
            });
          }
        });
      },
      import: () => {
        const isValidData = data => (typeof data === 'object'
          && Array.isArray(data.map)
          && data.map.length === this.city.cells.length);
        const modal = new ModalImport(isValidData);
        modal.show().then((importedData) => {
          if (importedData) {
            this.city.replace(importedData.map);
          }
        });
      },
      export: () => {
        const modal = new ModalExport(JSON.stringify({ map: this.city.cells }));
        modal.show();
      },
    };
  }
}
